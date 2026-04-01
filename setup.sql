-- ============================================================
-- setup.sql
-- Roshan Azeemi
-- March 2026
-- Database schema and seed data for the Mines game.
-- Run this file once to create the tables and populate sample data.
-- Mines Game - CS 1XD3
-- ============================================================

-- Players table — email is the primary key
CREATE TABLE IF NOT EXISTS players (
    email       VARCHAR(255) PRIMARY KEY,
    birth_date  DATE NOT NULL
);

-- Results table — auto-increment PK, foreign key to players
CREATE TABLE IF NOT EXISTS results (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    email       VARCHAR(255) NOT NULL,
    difficulty  VARCHAR(10)  NOT NULL,
    result      ENUM('win', 'loss') NOT NULL,
    score       INT          NOT NULL,
    played_date DATE         NOT NULL,
    played_time TIME         NOT NULL,
    FOREIGN KEY (email) REFERENCES players(email)
);

-- ============================================================
-- Seed data — 5 test users with several game results each
-- ============================================================

INSERT INTO players (email, birth_date) VALUES
    ('alice@example.com',   '2000-05-14'),
    ('bob@example.com',     '1999-11-22'),
    ('charlie@example.com', '2001-03-08'),
    ('diana@example.com',   '2000-09-30'),
    ('ethan@example.com',   '2002-01-17');

INSERT INTO results (email, difficulty, result, score, played_date, played_time) VALUES
    -- Alice: 4 rounds
    ('alice@example.com',   'easy',   'win',  240, '2026-03-28', '14:05:00'),
    ('alice@example.com',   'medium', 'win',  550, '2026-03-28', '14:12:00'),
    ('alice@example.com',   'hard',   'loss', 200, '2026-03-29', '09:30:00'),
    ('alice@example.com',   'medium', 'win',  500, '2026-03-30', '18:45:00'),
    -- Bob: 3 rounds
    ('bob@example.com',     'easy',   'win',  240, '2026-03-27', '10:00:00'),
    ('bob@example.com',     'easy',   'win',  240, '2026-03-28', '11:15:00'),
    ('bob@example.com',     'hard',   'loss', 100, '2026-03-29', '16:20:00'),
    -- Charlie: 5 rounds
    ('charlie@example.com', 'hard',   'win', 1000, '2026-03-26', '08:00:00'),
    ('charlie@example.com', 'hard',   'win',  900, '2026-03-27', '09:10:00'),
    ('charlie@example.com', 'hard',   'loss', 250, '2026-03-28', '10:30:00'),
    ('charlie@example.com', 'medium', 'win',  550, '2026-03-29', '12:00:00'),
    ('charlie@example.com', 'medium', 'loss', 100, '2026-03-30', '15:45:00'),
    -- Diana: 3 rounds
    ('diana@example.com',   'easy',   'win',  240, '2026-03-28', '20:00:00'),
    ('diana@example.com',   'medium', 'win',  550, '2026-03-29', '21:30:00'),
    ('diana@example.com',   'hard',   'win', 1000, '2026-03-30', '22:00:00'),
    -- Ethan: 2 rounds
    ('ethan@example.com',   'easy',   'loss',  50, '2026-03-29', '13:00:00'),
    ('ethan@example.com',   'easy',   'win',  240, '2026-03-30', '14:30:00');
