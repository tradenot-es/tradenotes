-- Per-trade news snapshot from the removed Marketaux integration; nothing reads or writes it any more.
alter table trades drop column if exists news_context;
