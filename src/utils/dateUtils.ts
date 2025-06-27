/**
 * 日本時間（JST）を扱うためのユーティリティ関数
 * SupabaseはUTCで保存するため、正確な現在時刻を取得
 */

/**
 * 現在の正確な時間をDate objectで取得
 */
export function getJSTDate(): Date {
  // 単純に現在の時刻を返す（ブラウザのタイムゾーンが正しく設定されている前提）
  return new Date();
}

/**
 * 現在の正確な時間をISO文字列で取得（UTC形式）
 */
export function getJSTISOString(): string {
  // SupabaseはUTCで保存するため、ローカル時間をUTCに変換
  return new Date().toISOString();
}

/**
 * 日本時間のタイムスタンプを取得
 */
export function getJSTTimestamp(): number {
  return new Date().getTime();
}