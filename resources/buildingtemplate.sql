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
-- Structure de la table `buildingtemplate`
--

CREATE TABLE `buildingtemplate` (
  `name` text,
  `price` float DEFAULT NULL,
  `storageCapacity` int(11) DEFAULT NULL,
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `createdAt` date DEFAULT NULL,
  `updatedAt` date DEFAULT NULL,
  `type` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=6 ;

--
-- Contenu de la table `buildingtemplate`
--

INSERT INTO `buildingtemplate` VALUES('Silo', 500, 500, 1, '2013-06-09', '2013-06-09', 'building');
INSERT INTO `buildingtemplate` VALUES('Cold Storage', 2000, 2000, 2, '2013-06-09', '2013-06-09', 'building');
INSERT INTO `buildingtemplate` VALUES('Barn', 1000, 1000, 5, '2013-06-09', '2013-06-09', 'building');
