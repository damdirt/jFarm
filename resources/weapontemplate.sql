-- phpMyAdmin SQL Dump
-- version 3.3.9.2
-- http://www.phpmyadmin.net
--
-- Serveur: localhost
-- Généré le : Mar 11 Juin 2013 à 20:03
-- Version du serveur: 5.5.9
-- Version de PHP: 5.2.17

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";

--
-- Base de données: `jfarm`
--

-- --------------------------------------------------------

--
-- Structure de la table `weapontemplate`
--

CREATE TABLE `weapontemplate` (
  `name` text,
  `damage` int(11) DEFAULT NULL,
  `hitRatio` int(11) DEFAULT NULL,
  `hitPerSecond` int(11) DEFAULT NULL,
  `price` float DEFAULT NULL,
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `createdAt` date DEFAULT NULL,
  `updatedAt` date DEFAULT NULL,
  `centerp` text,
  `rot` text,
  `x` int(11) DEFAULT NULL,
  `y` int(11) DEFAULT NULL,
  `img64` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=7 ;

--
-- Contenu de la table `weapontemplate`
--

INSERT INTO `weapontemplate` VALUES('Fork', 10, 40, 1, 0, 2, '2013-06-10', '2013-06-10', '{"x":-3,"y":2,"z":10}', '{"alphaD":90,"betaD":0,"gammaD":90}', 5, 0, 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAsAAAAZCAYAAADnstS2AAAALElEQVQ4jWNwtDb6zwAFBNmjiilSTAwmXTE6uH9y4v/7JydilxxVPKqY7ooB1c+3tcuPBsEAAAAASUVORK5CYII=');
INSERT INTO `weapontemplate` VALUES('Bat', 15, 50, 2, 100, 3, '2013-06-10', '2013-06-10', '{"x":-3,"y":2,"z":10}', '{"alphaD":90,"betaD":0,"gammaD":90}', 10, 0, 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAMAAAARCAYAAAAYNhYvAAAAqUlEQVQImTXOIQ4CMRAF0G9JuAEexxmWM+DwnACBXolY2hmNBscZdhOStiMRiA3pjOEEkGCLoMiXn5//8Yh+qcJDjr6FJnqZcDHhAhUeTbhYog8sUV/xhAmdTLhoohs0UVeTHjn6bcUFWfzahIsKH2HBNSZcstAe+XqY150d7n07NeGi0W8AAJr4naNf/SA8WnANAMAS9Tm4xR/nMbhZ7VAXgpvgf1+Fhy/N9oRkGdFVpwAAAABJRU5ErkJggg==');
INSERT INTO `weapontemplate` VALUES('Chainsaw', 50, 60, 2, 300, 4, '2013-06-10', '2013-06-10', '{"x":9,"y":2,"z":9}', '{"alphaD":0,"betaD":0,"gammaD":0}', 0, 9, 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAHCAYAAAAIy204AAAAfklEQVQokaXRoQ2AMBCFYUZAIIprHv4UjqGAkjR1hFnYA0HQrPQwkJBSTkCT3365u2Z7k/NqrgtKZTnXBfcmZ/blvWG/wBjzUtJLSQCTVhKMsSCGADh0Tg0Ak2i8ZhBD1/bcllXtRJ/g/VPuE7q2V3udMAYvNIihtXbUSp3wAI0rrQLjqZEtAAAAAElFTkSuQmCC');
INSERT INTO `weapontemplate` VALUES('ak47', 100, 90, 5, 500, 5, '2013-06-10', '2013-06-10', '{"x":-3,"y":5,"z":12}', '{"alphaD":-45,"betaD":0,"gammaD":-90}', 5, 10, 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAAGCAYAAADOic7aAAAAhUlEQVQYlY3PIQoCYRDF8d8BNGwRLGYxKp7AahA2i0m8gMVk8iJ6AzF4ETF4AA9gMq1lFj7Wxc8Hf3g83swwfGuAdYYFxg10McQMKxxQZbhi3sAtKbyxCb9EH3ecwtcULZ/Yx+ADk8iq+gp2eKHXNpxqhCM6SXbGNHyBJy65Rf+oxPZX4QO++CCk+Lv1qQAAAABJRU5ErkJggg==');
INSERT INTO `weapontemplate` VALUES('Watering Can', 0, 0, 0, 0, 6, '2013-06-10', '2013-06-10', '{"x":-3,"y":7,"z":8}', '{"alphaD":30,"betaD":0,"gammaD":-90}', 7, 10, 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAKCAYAAACE2W/HAAAA6ElEQVQokYWRrU4DURCFT0WDQaExJOtKMCvonTG1ra9o74za25lXaMAgy8PgEQ3hHZq0CodBNSTY5iIWSNhstycZMT/fJDMHAFCW1h9KGoVoyxBtOYwV45SK8fiMxNaktiNZrOrwT1J/L0vrHwVZ/I3EN41yj8W+SP0ZQK/RewAwAqvnvyXquRmk1TUABKmKi8urNYAM4BUU7bELBACepwmr7Vk9B0kzAADJYtUFstgdqR/q3J4G0+l5DaptO0H1TOoHinb/715Se/l9Tjtoe56nSasdP5/9aAODVMVRSwDgdpZuOgca+gaCeIMuwChpKwAAAABJRU5ErkJggg==');
