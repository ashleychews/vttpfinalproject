drop database if exists tixbuds;

create database tixbuds;

use tixbuds;

create table users (

    id char(8) not null,
    username varchar(32) not null,
    email varchar(128) not null,
    password varchar(72) not null,
    
    primary key(email)

);

create table user_profile (

    email varchar(128) not null,
    firstname varchar(50) not null,
    lastname varchar(50) not null,
    birthdate DATE not null,
    phonenumber VARCHAR(20) not null,
    FOREIGN KEY (email) REFERENCES users(email)

);


grant all privileges on tixbuds.* to 'fred'@'%';

flush privileges;