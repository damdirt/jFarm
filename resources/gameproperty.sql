-- phpMyAdmin SQL Dump
-- version 3.4.8
-- http://www.phpmyadmin.net
--
-- Host: mysql2.alwaysdata.com
-- Generation Time: Jun 06, 2013 at 11:48 PM
-- Server version: 5.1.49
-- PHP Version: 5.3.6-11

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `jfarm_dev`
--

-- --------------------------------------------------------

--
-- Table structure for table `gameproperty`
--

CREATE TABLE IF NOT EXISTS `gameproperty` (
  `name` text,
  `content` text,
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `createdAt` date DEFAULT NULL,
  `updatedAt` date DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=14 ;

--
-- Dumping data for table `gameproperty`
--

INSERT INTO `gameproperty` (`name`, `content`, `id`, `createdAt`, `updatedAt`) VALUES
('yardColor', '#8E663B', 1, '2013-05-26', '2013-05-29'),
('yardWidth', '80', 2, '2013-05-29', '2013-05-29'),
('defaultYardNumber', '11', 3, '2013-05-29', '2013-05-29'),
('skinColor', '#FFFF00', 4, '2013-05-29', '2013-05-29'),
('tshirtColor', '#FF00FF', 5, '2013-05-29', '2013-05-29'),
('pantsColor', '#0000FF', 6, '2013-05-29', '2013-05-29'),
('hairColor', '#555500', 7, '2013-05-29', '2013-05-29'),
('startMoney', '10000', 8, '2013-05-29', '2013-05-29'),
('easyLevelMoney', '100', 9, '2013-05-29', '2013-05-29'),
('mediumLevelMoney', '50', 10, '2013-05-29', '2013-05-29'),
('hardLevelMoney', '10', 11, '2013-05-29', '2013-05-29'),
('rangeToAdd', '5', 12, '2013-06-06', '2013-06-06'),
('firstPlayer', '0', 13, '2013-06-06', '2013-06-06');

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
