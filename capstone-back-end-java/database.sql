CREATE DATABASE capstonproject;
\c capstonproject;

CREATE TABLE users (
                       id SERIAL PRIMARY KEY,
                       fullname VARCHAR(100) DEFAULT '',
                       username varchar(100) NOT NULL,
                       password VARCHAR(100) NOT NULL,
                       phone_number VARCHAR(10) NOT NULL,
                       email VARCHAR(100) DEFAULT '',
                       address VARCHAR(200) DEFAULT '',
                       created_at TIMESTAMP,
                       updated_at TIMESTAMP,
                       is_active BOOLEAN DEFAULT TRUE,
                       date_of_birth DATE,
                       facebook_account_id INT DEFAULT 0,
                       google_account_id INT DEFAULT 0
);

CREATE TABLE tokens (
                        id SERIAL PRIMARY KEY,
                        token VARCHAR(255) UNIQUE NOT NULL,
                        token_type VARCHAR(50) NOT NULL,
                        expiration_date TIMESTAMP,
                        revoked BOOLEAN NOT NULL,
                        expired BOOLEAN NOT NULL,
                        user_id INT,
                        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE social_accounts (
                                 id SERIAL PRIMARY KEY,
                                 provider VARCHAR(20) NOT NULL,
                                 provider_id VARCHAR(50) NOT NULL,
                                 email VARCHAR(150) NOT NULL,
                                 name VARCHAR(100) NOT NULL,
                                 user_id INT,
                                 FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

