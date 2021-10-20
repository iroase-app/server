```
CREATE TABLE IF NOT EXISTS iroase.Users (
  `_ID` BIGINT auto_increment NOT NULL,
  Username TINYTEXT NOT NULL,
  Salt TEXT NOT NULL,
  HashedPassword TEXT NOT NULL,
  DateRegistered DATETIME NOT NULL,
  CONSTRAINT users_PK PRIMARY KEY (`_ID`)
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;
```