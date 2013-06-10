-- phpMyAdmin SQL Dump
-- version 3.3.9.2
-- http://www.phpmyadmin.net
--
-- Serveur: localhost
-- Généré le : Sam 08 Juin 2013 à 22:01
-- Version du serveur: 5.5.9
-- Version de PHP: 5.2.17

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Base de données: `jfarm`
--

-- --------------------------------------------------------

--
-- Structure de la table `gameproperty`
--

CREATE TABLE `gameproperty` (
  `name` text,
  `content` text,
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `createdAt` date DEFAULT NULL,
  `updatedAt` date DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=14 ;

--
-- Contenu de la table `gameproperty`
--

INSERT INTO `gameproperty` VALUES('yardColor', '#8E663B', 1, '2013-05-26', '2013-05-29');
INSERT INTO `gameproperty` VALUES('yardWidth', '80', 2, '2013-05-29', '2013-05-29');
INSERT INTO `gameproperty` VALUES('defaultYardNumber', '11', 3, '2013-05-29', '2013-05-29');
INSERT INTO `gameproperty` VALUES('skinColor', '#FFFF00', 4, '2013-05-29', '2013-05-29');
INSERT INTO `gameproperty` VALUES('tshirtColor', '#FF00FF', 5, '2013-05-29', '2013-05-29');
INSERT INTO `gameproperty` VALUES('pantsColor', '#0000FF', 6, '2013-05-29', '2013-05-29');
INSERT INTO `gameproperty` VALUES('hairColor', '#555500', 7, '2013-05-29', '2013-05-29');
INSERT INTO `gameproperty` VALUES('startMoney', '10000', 8, '2013-05-29', '2013-05-29');
INSERT INTO `gameproperty` VALUES('easyLevelMoney', '100', 9, '2013-05-29', '2013-05-29');
INSERT INTO `gameproperty` VALUES('mediumLevelMoney', '50', 10, '2013-05-29', '2013-05-29');
INSERT INTO `gameproperty` VALUES('hardLevelMoney', '10', 11, '2013-05-29', '2013-05-29');
INSERT INTO `gameproperty` VALUES('rangeToAdd', '5', 12, '2013-06-06', '2013-06-08');
INSERT INTO `gameproperty` VALUES('firstPlayer', '0', 13, '2013-06-06', '2013-06-08');
