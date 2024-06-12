-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 12, 2024 at 07:33 PM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `team_project`
--

-- --------------------------------------------------------

--
-- Table structure for table `login`
--

CREATE TABLE `login` (
  `user_id` int(11) NOT NULL COMMENT 'Auto ID that creates an ID for each user',
  `first_name` varchar(50) NOT NULL COMMENT 'Stores the first name of the user',
  `last_name` varchar(50) NOT NULL COMMENT 'Stores the last name of the user',
  `email` varchar(50) NOT NULL COMMENT 'Stores the email address of the user',
  `credential` varchar(50) NOT NULL COMMENT 'Stores the password of the user'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `original_files`
--

CREATE TABLE `original_files` (
  `file_id` int(11) NOT NULL COMMENT 'Stores the auto generated file ID',
  `user_id` int(11) NOT NULL COMMENT 'Stores the user who owns the file',
  `file_name` varchar(150) NOT NULL COMMENT 'Stores the name of the file',
  `file_content` blob NOT NULL COMMENT 'Stores the actual file content of the file',
  `original_language` varchar(50) NOT NULL COMMENT 'Stores the original language of the file',
  `upload_date` date NOT NULL COMMENT 'Stores the date of the upload'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `translated_files`
--

CREATE TABLE `translated_files` (
  `file_id` int(11) NOT NULL COMMENT 'Auto ID that uniquely identifies each translated file',
  `og_file_id` int(11) DEFAULT NULL COMMENT 'Foreign key storing the original file',
  `file_content` longblob NOT NULL COMMENT 'Stores the actual content of each translated file',
  `translated_language` varchar(20) DEFAULT NULL COMMENT 'Stores the language translated to',
  `upload_date` date NOT NULL COMMENT 'Stores the date of the translation'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `login`
--
ALTER TABLE `login`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `original_files`
--
ALTER TABLE `original_files`
  ADD PRIMARY KEY (`file_id`),
  ADD UNIQUE KEY `unique_docs` (`user_id`,`file_name`);

--
-- Indexes for table `translated_files`
--
ALTER TABLE `translated_files`
  ADD PRIMARY KEY (`file_id`),
  ADD KEY `FK_OgDoc` (`og_file_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `login`
--
ALTER TABLE `login`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Auto ID that creates an ID for each user', AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `original_files`
--
ALTER TABLE `original_files`
  MODIFY `file_id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Stores the auto generated file ID', AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `translated_files`
--
ALTER TABLE `translated_files`
  MODIFY `file_id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Auto ID that uniquely identifies each translated file', AUTO_INCREMENT=29;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `original_files`
--
ALTER TABLE `original_files`
  ADD CONSTRAINT `FK_User` FOREIGN KEY (`user_id`) REFERENCES `login` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `translated_files`
--
ALTER TABLE `translated_files`
  ADD CONSTRAINT `FK_OgDoc` FOREIGN KEY (`og_file_id`) REFERENCES `original_files` (`file_id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
