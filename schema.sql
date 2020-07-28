DROP TABLE IF EXISTS joke;
CREATE TABLE joke(
    id SERIAL PRIMARY KEY,
    type VARCHAR(255),
    setup VARCHAR(255),
    punchline TEXT
)