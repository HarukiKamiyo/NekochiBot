/**
 * @file src/events/voiceStateUpdate.ts
 * @description Discordのボイスチャンネルの状態変化（参加、退出など）を監視し、
 *              指定されたボイスチャンネルへの出入りを通知するイベントハンドラです。
 *              勉強時間の記録も行います。
 */
// src/events/voiceStateUpdate.ts
import { VoiceState, Client, TextChannel, EmbedBuilder } from "discord.js"; // Discord API からの音声状態、クライアント、テキストチャンネル、埋め込みメッセージに必要なクラスをインポート
import { TARGET_VOICE_CHANNEL_ID, NOTIFICATION_CHANNEL_ID } from "../config"; // 設定ファイルから対象のボイスチャンネルIDと通知チャンネルIDをインポート
import { formatDuration } from "../utils"; // 滞在時間のフォーマットに使用するユーティリティ関数をインポート

// 各ユーザーのボイスチャンネル入室時刻を記録するためのオブジェクト。
// キーはユーザーID、値は入室した`Date`オブジェクト。
const userEntryTimes: { [userId: string]: Date } = {};

export default (client: Client) => {
  // 'voiceStateUpdate' イベントが発生した際に実行されるリスナーを登録
  // ユーザーがボイスチャンネルに参加、退出、移動、ミュート状態を変更した時などに発火します。
  client.on(
    "voiceStateUpdate",
    async (oldState: VoiceState, newState: VoiceState) => {
      // イベントが対象のボイスチャンネルに関連しない場合は処理を終了
      // (TARGET_VOICE_CHANNEL_ID への出入りでない場合)
      if (
        newState.channelId !== TARGET_VOICE_CHANNEL_ID &&
        oldState.channelId !== TARGET_VOICE_CHANNEL_ID
      ) {
        return; // 対象外のチャンネルでの変化は無視
      }

      // 通知を送信するテキストチャンネルを取得
      const notificationChannel = await client.channels.fetch(
        NOTIFICATION_CHANNEL_ID!,
      );
      // 取得したチャンネルがテキストチャンネルでない、または見つからない場合はエラーログを出力し処理を終了
      if (!notificationChannel?.isTextBased()) {
        console.error(
          "通知チャンネルが見つからないか、テキストチャンネルではありません。",
        );
        return;
      }

      const member = newState.member || oldState.member; // 状態変化を起こしたメンバーを取得
      if (!member) return; // メンバー情報が取得できない場合は処理を終了

      const notificationChannelText = notificationChannel as TextChannel; // 型ガードによりTextChannelであることを保証

      // ユーザーが入室した場合の処理
      if (
        !oldState.channelId && // 以前のチャンネルIDがない (どこにも参加していなかった)
        newState.channelId === TARGET_VOICE_CHANNEL_ID // 新しいチャンネルがターゲットのボイスチャンネルである
      ) {
        userEntryTimes[member.id] = new Date(); // ユーザーIDをキーとして入室時刻を記録
        const embed = new EmbedBuilder() // 埋め込みメッセージを作成
          .setColor(0x00ff00) // 緑色に設定
          .setAuthor({
            name: member.displayName, // メンバーの表示名
            iconURL: member.displayAvatarURL(), // メンバーのアバターURL
          })
          .setDescription(`${member.displayName} が勉強開始しました📚`) // メッセージ内容
          .setTimestamp(); // 現在のタイムスタンプを追加
        notificationChannelText.send({
          embeds: [embed], // 作成した埋め込みメッセージを送信
        });
      }

      // ユーザーが退室した場合の処理
      if (
        oldState.channelId === TARGET_VOICE_CHANNEL_ID && // 以前のチャンネルがターゲットのボイスチャンネルである
        !newState.channelId // 新しいチャンネルIDがない (どこにも参加していない)
      ) {
        const entryTime = userEntryTimes[member.id]; // 記録された入室時刻を取得

        if (!entryTime) {
          // 入室時刻の記録がない場合 (例: Botが再起動した際に入室中のユーザーだった場合)
          const embed = new EmbedBuilder()
            .setColor(0xffa500) // オレンジ色
            .setAuthor({
              name: member.displayName,
              iconURL: member.displayAvatarURL(),
            })
            .setDescription(
              `${member.displayName} が退室しました（入室時刻の記録なし）`,
            )
            .setTimestamp();
          notificationChannelText.send({ embeds: [embed] });
          return; // 処理を終了
        }

        const exitTime = new Date(); // 現在の退室時刻
        const duration = exitTime.getTime() - entryTime.getTime(); // 滞在時間をミリ秒で計算
        delete userEntryTimes[member.id]; // 記録からユーザーの入室時刻を削除

        const formattedDuration = formatDuration(duration); // 滞在時間を読みやすい形式にフォーマット
        const embed = new EmbedBuilder()
          .setColor(0xff0000) // 赤色
          .setAuthor({
            name: member.displayName,
            iconURL: member.displayAvatarURL(),
          })
          .setDescription(
            `${member.displayName} が勉強終了しました🍵 \n ${member.displayName} が成長した時間 : ${formattedDuration}`,
          )
          .setTimestamp();
        notificationChannelText.send({ embeds: [embed] });
      }

      // ユーザーが同じボイスチャンネル内でミュート、スピーカーの状態などを変更した場合、
      // `sessionId` は変わるが `channelId` は変わらない。
      // この場合は特別な処理は行わないため、return で終了。
      if (
        oldState.channelId === TARGET_VOICE_CHANNEL_ID &&
        newState.channelId === TARGET_VOICE_CHANNEL_ID &&
        oldState.sessionId !== newState.sessionId
      ) {
        return;
      }
    },
  );
};
