-- Convert sold_date column from timestamp to text
ALTER TABLE vehicles 
  ALTER COLUMN sold_date TYPE TEXT USING to_char(sold_date, 'YYYY-MM-DD');