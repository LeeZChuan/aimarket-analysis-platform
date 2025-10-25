/*
  # AstraTrade 数据库初始化

  1. 新建表
    - `user_watchlists` - 用户自选股列表
      - `id` (uuid, 主键)
      - `user_id` (uuid, 用户ID)
      - `symbol` (text, 股票代码)
      - `name` (text, 股票名称)
      - `added_at` (timestamptz, 添加时间)
    
    - `chat_history` - AI对话历史
      - `id` (uuid, 主键)
      - `user_id` (uuid, 用户ID)
      - `role` (text, 角色: user/assistant)
      - `content` (text, 对话内容)
      - `model` (text, 使用的模型)
      - `created_at` (timestamptz, 创建时间)
    
    - `market_data` - 行情数据缓存
      - `id` (uuid, 主键)
      - `symbol` (text, 股票代码)
      - `date` (date, 日期)
      - `open` (numeric, 开盘价)
      - `high` (numeric, 最高价)
      - `low` (numeric, 最低价)
      - `close` (numeric, 收盘价)
      - `volume` (bigint, 成交量)
      - `updated_at` (timestamptz, 更新时间)

  2. 安全策略
    - 启用所有表的RLS
    - 用户只能访问自己的自选股和对话记录
    - 行情数据为公开读取
*/

-- 创建用户自选股表
CREATE TABLE IF NOT EXISTS user_watchlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  symbol text NOT NULL,
  name text NOT NULL,
  added_at timestamptz DEFAULT now()
);

-- 创建对话历史表
CREATE TABLE IF NOT EXISTS chat_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  model text DEFAULT 'auto',
  created_at timestamptz DEFAULT now()
);

-- 创建行情数据表
CREATE TABLE IF NOT EXISTS market_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol text NOT NULL,
  date date NOT NULL,
  open numeric(10, 2) NOT NULL,
  high numeric(10, 2) NOT NULL,
  low numeric(10, 2) NOT NULL,
  close numeric(10, 2) NOT NULL,
  volume bigint DEFAULT 0,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(symbol, date)
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_watchlist_user ON user_watchlists(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_user ON chat_history(user_id);
CREATE INDEX IF NOT EXISTS idx_market_symbol_date ON market_data(symbol, date);

-- 启用行级安全
ALTER TABLE user_watchlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_data ENABLE ROW LEVEL SECURITY;

-- 自选股访问策略
CREATE POLICY "Users can view own watchlist"
  ON user_watchlists FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own watchlist"
  ON user_watchlists FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own watchlist"
  ON user_watchlists FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 对话历史访问策略
CREATE POLICY "Users can view own chat history"
  ON chat_history FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chat history"
  ON chat_history FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 行情数据访问策略（公开读取）
CREATE POLICY "Anyone can view market data"
  ON market_data FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can manage market data"
  ON market_data FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
