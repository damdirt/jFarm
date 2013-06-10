-- phpMyAdmin SQL Dump
-- version 3.3.9.2
-- http://www.phpmyadmin.net
--
-- Serveur: localhost
-- Généré le : Mar 11 Juin 2013 à 00:16
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
-- Structure de la table `croptemplate`
--

CREATE TABLE `croptemplate` (
  `name` text,
  `maturationTime` int(11) DEFAULT NULL,
  `decayTime` int(11) DEFAULT NULL,
  `productivity` int(11) DEFAULT NULL,
  `storabilityTime` int(11) DEFAULT NULL,
  `price` float DEFAULT NULL,
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `createdAt` date DEFAULT NULL,
  `updatedAt` date DEFAULT NULL,
  `type` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=4 ;

--
-- Contenu de la table `croptemplate`
--

INSERT INTO `croptemplate` VALUES('Wheat', 10, 5, 100, 10, 20, 1, '2013-06-09', '2013-06-09', 'crop');
INSERT INTO `croptemplate` VALUES('Corn', 12, 5, 70, 10, 20, 2, '2013-06-09', '2013-06-09', 'crop');
INSERT INTO `croptemplate` VALUES('Tomatoes', 6, 4, 40, 5, 20, 3, '2013-06-09', '2013-06-09', 'crop');
