-- Tạo bảng để lưu các sheet tài chính
CREATE TABLE finance_sheets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_password TEXT NOT NULL,
  name TEXT NOT NULL,
  month TEXT NOT NULL,
  year TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tạo bảng để lưu các entry trong sheet
CREATE TABLE finance_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sheet_id UUID REFERENCES finance_sheets(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  overview TEXT DEFAULT '',
  amount DECIMAL DEFAULT 0,
  work TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tạo index để tăng tốc độ truy vấn
CREATE INDEX idx_finance_sheets_password ON finance_sheets(user_password);
CREATE INDEX idx_finance_entries_sheet_id ON finance_entries(sheet_id);

-- Tạo function để tự động update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Tạo trigger để tự động update updated_at
CREATE TRIGGER update_finance_sheets_updated_at 
    BEFORE UPDATE ON finance_sheets 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
