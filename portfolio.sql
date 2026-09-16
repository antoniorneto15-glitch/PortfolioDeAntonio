create database portfolio;
use portfolio;
create table login(
	id int auto_increment PRIMARY KEY,
    usuario varchar(100)not null ,
    password varchar(30)not null
);
insert into login (usuario, password) values
('Antonio', 'antneto@2');

insert into login (usuario, password) values
('Admin', 'adm1234');

insert into login (usuario, password) values
('Professor', 'prof2026');

select * from login;