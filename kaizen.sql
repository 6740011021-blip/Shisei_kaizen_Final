-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 20, 2026 at 06:37 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `kaizen`
--
CREATE DATABASE IF NOT EXISTS `kaizen` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `kaizen`;

-- --------------------------------------------------------

--
-- Table structure for table `devices`
--

CREATE TABLE `devices` (
  `id` int(11) NOT NULL,
  `device_code` varchar(50) NOT NULL,
  `device_name` varchar(100) NOT NULL,
  `api_key` varchar(100) NOT NULL,
  `created_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `posture_events`
--

CREATE TABLE `posture_events` (
  `id` int(20) NOT NULL,
  `device_id` int(11) NOT NULL,
  `event_type` varchar(30) NOT NULL,
  `event_time` datetime NOT NULL,
  `fsr_value` int(11) NOT NULL,
  `distance_cm` double(6,2) NOT NULL,
  `duration_seconds` int(11) NOT NULL,
  `note` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `posture_events`
--

INSERT INTO `posture_events` (`id`, `device_id`, `event_type`, `event_time`, `fsr_value`, `distance_cm`, `duration_seconds`, `note`) VALUES
(1, 1, 'NO_SITTING', '2026-09-20 21:38:23', 0, 50.70, 2, 'Auto Log'),
(2, 1, 'NO_SITTING', '2026-09-20 21:42:39', 0, 6.16, 2, 'Auto Log'),
(3, 1, 'NO_SITTING', '2026-09-20 21:42:41', 0, 9.09, 2, 'Auto Log'),
(4, 1, 'NO_SITTING', '2026-09-20 21:42:43', 0, 9.09, 2, 'Auto Log'),
(5, 1, 'NO_SITTING', '2026-09-20 21:42:44', 0, 8.39, 2, 'Auto Log'),
(6, 1, 'POSTURE_OK', '2026-09-20 21:42:48', 3842, 8.40, 2, 'Auto Log'),
(7, 1, 'POSTURE_OK', '2026-09-20 21:42:49', 3965, 8.40, 2, 'Auto Log'),
(8, 1, 'POSTURE_OK', '2026-09-20 21:42:50', 3866, 8.39, 2, 'Auto Log'),
(9, 1, 'POSTURE_OK', '2026-09-20 21:42:53', 3951, 8.39, 2, 'Auto Log'),
(10, 1, 'POSTURE_OK', '2026-09-20 21:42:54', 3921, 4.56, 2, 'Auto Log'),
(11, 1, 'BAD_POSTURE', '2026-09-20 21:42:55', 3955, 16.16, 2, 'Auto Log'),
(12, 1, 'POSTURE_OK', '2026-09-20 21:42:56', 3807, 10.43, 2, 'Auto Log'),
(13, 1, 'NO_SITTING', '2026-09-20 21:42:58', 0, 11.44, 2, 'Auto Log'),
(14, 1, 'POSTURE_OK', '2026-09-20 21:42:59', 3739, 8.08, 2, 'Auto Log'),
(15, 1, 'POSTURE_OK', '2026-09-20 21:43:01', 3687, 7.43, 2, 'Auto Log'),
(16, 1, 'POSTURE_OK', '2026-09-20 21:43:02', 3728, 9.09, 2, 'Auto Log'),
(17, 1, 'BAD_POSTURE', '2026-09-20 21:43:03', 3721, 17.13, 2, 'Auto Log'),
(18, 1, 'BAD_POSTURE', '2026-09-20 21:43:05', 3722, 16.17, 2, 'Auto Log'),
(19, 1, 'BAD_POSTURE', '2026-09-20 21:43:06', 3725, 43.03, 2, 'Auto Log'),
(20, 1, 'BAD_POSTURE_ALERT', '2026-09-20 21:43:07', 3723, 18.11, 2, 'Auto Log'),
(21, 1, 'BAD_POSTURE', '2026-09-20 21:43:09', 3723, 18.11, 2, 'Auto Log'),
(22, 1, 'BAD_POSTURE', '2026-09-20 21:43:10', 3723, 18.11, 2, 'Auto Log'),
(23, 1, 'BAD_POSTURE_ALERT', '2026-09-20 21:43:11', 3753, 39.99, 2, 'Auto Log'),
(24, 1, 'BAD_POSTURE', '2026-09-20 21:43:14', 3753, 39.99, 2, 'Auto Log'),
(25, 1, 'BAD_POSTURE', '2026-09-20 21:43:15', 3734, 19.09, 2, 'Auto Log'),
(26, 1, 'BAD_POSTURE_ALERT', '2026-09-20 21:43:16', 3743, 41.62, 2, 'Auto Log'),
(27, 1, 'BAD_POSTURE', '2026-09-20 21:43:19', 3743, 41.62, 2, 'Auto Log'),
(28, 1, 'BAD_POSTURE', '2026-09-20 21:43:20', 3718, 43.46, 2, 'Auto Log'),
(29, 1, 'NO_SITTING', '2026-09-20 21:43:22', 0, 17.46, 2, 'Auto Log'),
(30, 1, 'NO_SITTING', '2026-09-20 21:43:29', 0, 16.48, 2, 'Auto Log'),
(31, 1, 'NO_SITTING', '2026-09-20 21:43:39', 0, 46.31, 2, 'Auto Log'),
(32, 1, 'NO_SITTING', '2026-09-20 21:43:40', 0, 10.77, 2, 'Auto Log'),
(33, 1, 'NO_SITTING', '2026-09-20 21:43:41', 0, 57.04, 2, 'Auto Log'),
(34, 1, 'NO_SITTING', '2026-09-20 21:43:42', 0, 16.81, 2, 'Auto Log'),
(35, 1, 'NO_SITTING', '2026-09-20 21:43:44', 0, 13.81, 2, 'Auto Log'),
(36, 1, 'NO_SITTING', '2026-09-20 21:43:45', 0, 12.45, 2, 'Auto Log'),
(37, 1, 'NO_SITTING', '2026-09-20 21:43:46', 0, 12.45, 2, 'Auto Log'),
(38, 1, 'NO_SITTING', '2026-09-20 21:43:48', 0, 12.45, 2, 'Auto Log'),
(39, 1, 'NO_SITTING', '2026-09-20 21:43:49', 0, 12.79, 2, 'Auto Log'),
(40, 1, 'NO_SITTING', '2026-09-20 21:43:53', 0, 12.79, 2, 'Auto Log'),
(41, 1, 'NO_SITTING', '2026-09-20 21:43:53', 0, 11.44, 2, 'Auto Log'),
(42, 1, 'NO_SITTING', '2026-09-20 21:43:55', 0, 12.13, 2, 'Auto Log'),
(43, 1, 'NO_SITTING', '2026-09-20 21:43:56', 0, 13.14, 2, 'Auto Log'),
(44, 1, 'NO_SITTING', '2026-09-20 21:43:57', 0, 16.17, 2, 'Auto Log'),
(45, 1, 'NO_SITTING', '2026-09-20 21:44:01', 0, 12.79, 2, 'Auto Log'),
(46, 1, 'NO_SITTING', '2026-09-20 21:44:03', 0, 17.13, 2, 'Auto Log'),
(47, 1, 'NO_SITTING', '2026-09-20 21:44:04', 0, 15.14, 2, 'Auto Log'),
(48, 1, 'NO_SITTING', '2026-09-20 21:44:23', 0, 60.18, 2, 'Auto Log'),
(49, 1, 'NO_SITTING', '2026-09-20 21:44:24', 0, 11.78, 2, 'Auto Log'),
(50, 1, 'NO_SITTING', '2026-09-20 21:44:34', 0, 10.77, 2, 'Auto Log'),
(51, 1, 'NO_SITTING', '2026-09-20 21:44:39', 0, 11.10, 2, 'Auto Log'),
(52, 1, 'NO_SITTING', '2026-09-20 21:44:41', 0, 8.75, 2, 'Auto Log'),
(53, 1, 'NO_SITTING', '2026-09-20 21:44:41', 0, 11.78, 2, 'Auto Log'),
(54, 1, 'NO_SITTING', '2026-09-20 21:44:51', 0, 9.09, 2, 'Auto Log'),
(55, 1, 'NO_SITTING', '2026-09-20 21:44:51', 0, 11.44, 2, 'Auto Log'),
(56, 1, 'NO_SITTING', '2026-09-20 21:44:54', 0, 9.09, 2, 'Auto Log'),
(57, 1, 'NO_SITTING', '2026-09-20 21:44:55', 0, 9.76, 2, 'Auto Log'),
(58, 1, 'BAD_POSTURE', '2026-09-20 21:45:46', 4095, 16.17, 2, 'Auto Log'),
(59, 1, 'BAD_POSTURE_ALERT', '2026-09-20 21:45:46', 4095, 16.17, 2, 'Auto Log'),
(60, 1, 'NO_SITTING', '2026-09-20 21:45:56', 0, 6.16, 2, 'Auto Log'),
(61, 1, 'NO_SITTING', '2026-09-20 21:45:57', 0, 6.79, 2, 'Auto Log'),
(62, 1, 'NO_SITTING', '2026-09-20 21:45:59', 0, 7.75, 2, 'Auto Log'),
(63, 1, 'NO_SITTING', '2026-09-20 21:46:01', 0, 4.87, 2, 'Auto Log'),
(64, 1, 'NO_SITTING', '2026-09-20 21:46:02', 0, 7.44, 2, 'Auto Log'),
(65, 1, 'NO_SITTING', '2026-09-20 21:46:04', 0, 7.77, 2, 'Auto Log'),
(66, 1, 'NO_SITTING', '2026-09-20 21:46:05', 0, 7.75, 2, 'Auto Log'),
(67, 1, 'NO_SITTING', '2026-09-20 21:46:07', 0, 7.12, 2, 'Auto Log'),
(68, 1, 'NO_SITTING', '2026-09-20 21:46:08', 0, 5.51, 2, 'Auto Log'),
(69, 1, 'NO_SITTING', '2026-09-20 21:46:09', 0, 3.91, 2, 'Auto Log'),
(70, 1, 'NO_SITTING', '2026-09-20 21:46:11', 0, 3.91, 2, 'Auto Log'),
(71, 1, 'NO_SITTING', '2026-09-20 21:46:12', 0, 4.24, 2, 'Auto Log'),
(72, 1, 'NO_SITTING', '2026-09-20 21:46:14', 0, 4.56, 2, 'Auto Log'),
(73, 1, 'BAD_POSTURE', '2026-09-20 21:46:14', 4095, 16.17, 2, 'Auto Log'),
(74, 1, 'NO_SITTING', '2026-09-20 21:46:15', 0, 4.87, 2, 'Auto Log'),
(75, 1, 'NO_SITTING', '2026-09-20 21:46:16', 0, 4.87, 2, 'Auto Log'),
(76, 1, 'BAD_POSTURE', '2026-09-20 21:46:48', 3792, 16.81, 2, 'Auto Log'),
(77, 1, 'DISTANCE_UNAVAILABLE', '2026-09-20 21:46:50', 3840, -1.00, 2, 'Auto Log'),
(78, 1, 'DISTANCE_UNAVAILABLE', '2026-09-20 21:46:55', 1769, -1.00, 2, 'Auto Log'),
(79, 1, 'BAD_POSTURE', '2026-09-20 21:46:59', 4030, 26.48, 2, 'Auto Log'),
(80, 1, 'BAD_POSTURE_ALERT', '2026-09-20 21:46:59', 3989, 71.50, 2, 'Auto Log'),
(81, 1, 'POSTURE_OK', '2026-09-20 21:47:27', 3975, 4.24, 2, 'Auto Log'),
(82, 1, 'BAD_POSTURE_ALERT', '2026-09-20 21:47:33', 4017, 19.41, 2, 'Auto Log'),
(83, 1, 'BAD_POSTURE', '2026-09-20 21:47:36', 4017, 19.41, 2, 'Auto Log'),
(84, 1, 'NO_SITTING', '2026-09-20 21:47:37', 0, -1.00, 2, 'Auto Log'),
(85, 1, 'NO_SITTING', '2026-09-20 21:48:10', 0, 9.76, 2, 'Auto Log'),
(86, 1, 'POSTURE_OK', '2026-09-20 21:48:17', 3675, 7.75, 2, 'Auto Log'),
(87, 1, 'NO_SITTING', '2026-09-20 21:48:48', 0, 58.64, 2, 'Auto Log'),
(88, 1, 'NO_SITTING', '2026-09-20 21:48:49', 0, 9.09, 2, 'Auto Log'),
(89, 1, 'NO_SITTING', '2026-09-20 21:48:53', 0, 6.47, 2, 'Auto Log'),
(90, 1, 'NO_SITTING', '2026-09-20 21:48:59', 0, 6.79, 2, 'Auto Log'),
(91, 1, 'NO_SITTING', '2026-09-20 21:48:59', 0, 4.87, 2, 'Auto Log'),
(92, 1, 'NO_SITTING', '2026-09-20 21:49:04', 0, 4.87, 2, 'Auto Log'),
(93, 1, 'NO_SITTING', '2026-09-20 21:49:05', 0, 5.51, 2, 'Auto Log'),
(94, 1, 'NO_SITTING', '2026-09-20 21:49:34', 0, 7.75, 2, 'Auto Log'),
(95, 1, 'NO_SITTING', '2026-09-20 21:49:39', 0, 7.75, 2, 'Auto Log'),
(96, 1, 'NO_SITTING', '2026-09-20 22:04:58', 0, 3.91, 2, 'Auto Log'),
(97, 1, 'NO_SITTING', '2026-09-20 22:04:59', 0, 3.93, 2, 'Auto Log'),
(98, 1, 'NO_SITTING', '2026-09-20 22:05:01', 0, 3.60, 2, 'Auto Log'),
(99, 1, 'NO_SITTING', '2026-09-20 22:05:02', 0, 2.32, 2, 'Auto Log'),
(100, 1, 'NO_SITTING', '2026-09-20 22:05:03', 0, 14.47, 2, 'Auto Log'),
(101, 1, 'NO_SITTING', '2026-09-20 22:05:05', 0, 4.87, 2, 'Auto Log'),
(102, 1, 'NO_SITTING', '2026-09-20 22:05:06', 0, 14.82, 2, 'Auto Log'),
(103, 1, 'NO_SITTING', '2026-09-20 22:05:07', 0, 16.17, 2, 'Auto Log'),
(104, 1, 'NO_SITTING', '2026-09-20 22:05:09', 0, 16.17, 2, 'Auto Log'),
(105, 1, 'BAD_POSTURE', '2026-09-20 22:05:10', 3481, 16.17, 2, 'Auto Log'),
(106, 1, 'BAD_POSTURE', '2026-09-20 22:05:11', 3342, 16.17, 2, 'Auto Log'),
(107, 1, 'BAD_POSTURE_ALERT', '2026-09-20 22:05:12', 3776, 15.16, 2, 'Auto Log'),
(108, 1, 'BAD_POSTURE', '2026-09-20 22:05:14', 3776, 15.16, 2, 'Auto Log'),
(109, 1, 'POSTURE_OK', '2026-09-20 22:05:16', 3736, 11.11, 2, 'Auto Log'),
(110, 1, 'BAD_POSTURE', '2026-09-20 22:05:17', 4068, 16.17, 2, 'Auto Log'),
(111, 1, 'BAD_POSTURE', '2026-09-20 22:05:18', 4095, 16.17, 2, 'Auto Log'),
(112, 1, 'BAD_POSTURE', '2026-09-20 22:05:20', 4067, 16.17, 2, 'Auto Log'),
(113, 1, 'BAD_POSTURE', '2026-09-20 22:05:21', 4095, 38.36, 2, 'Auto Log'),
(114, 1, 'NO_SITTING', '2026-09-20 22:05:23', 0, 49.56, 2, 'Auto Log'),
(115, 1, 'POSTURE_OK', '2026-09-20 22:05:25', 4095, 12.13, 2, 'Auto Log'),
(116, 1, 'NO_SITTING', '2026-09-20 22:05:26', 0, 16.50, 2, 'Auto Log'),
(117, 1, 'BAD_POSTURE', '2026-09-20 22:05:28', 4095, 16.50, 2, 'Auto Log'),
(118, 1, 'BAD_POSTURE', '2026-09-20 22:05:29', 4033, 16.50, 2, 'Auto Log'),
(119, 1, 'DISTANCE_UNAVAILABLE', '2026-09-20 22:05:30', 3905, -1.00, 2, 'Auto Log'),
(120, 1, 'BAD_POSTURE', '2026-09-20 22:05:31', 3826, 17.13, 2, 'Auto Log'),
(121, 1, 'BAD_POSTURE', '2026-09-20 22:05:33', 3911, 18.44, 2, 'Auto Log'),
(122, 1, 'BAD_POSTURE_ALERT', '2026-09-20 22:05:34', 3900, 17.13, 2, 'Auto Log'),
(123, 1, 'BAD_POSTURE', '2026-09-20 22:05:36', 3900, 17.13, 2, 'Auto Log'),
(124, 1, 'BAD_POSTURE', '2026-09-20 22:05:37', 3880, 16.17, 2, 'Auto Log'),
(125, 1, 'BAD_POSTURE', '2026-09-20 22:05:39', 3899, 16.17, 2, 'Auto Log'),
(126, 1, 'BAD_POSTURE', '2026-09-20 22:05:40', 3892, 36.29, 2, 'Auto Log'),
(127, 1, 'BAD_POSTURE_ALERT', '2026-09-20 22:05:40', 3895, 29.94, 2, 'Auto Log'),
(128, 1, 'BAD_POSTURE', '2026-09-20 22:05:43', 3895, 29.94, 2, 'Auto Log'),
(129, 1, 'NO_SITTING', '2026-09-20 22:05:44', 0, 16.50, 2, 'Auto Log'),
(130, 1, 'NO_SITTING', '2026-09-20 22:05:46', 0, 25.90, 2, 'Auto Log'),
(131, 1, 'NO_SITTING', '2026-09-20 22:05:47', 0, 16.50, 2, 'Auto Log'),
(132, 1, 'BAD_POSTURE', '2026-09-20 22:05:49', 3978, 29.94, 2, 'Auto Log'),
(133, 1, 'DISTANCE_UNAVAILABLE', '2026-09-20 22:05:50', 3929, -1.00, 2, 'Auto Log'),
(134, 1, 'DISTANCE_UNAVAILABLE', '2026-09-20 22:05:52', 3882, -1.00, 2, 'Auto Log'),
(135, 1, 'DISTANCE_UNAVAILABLE', '2026-09-20 22:05:54', 4001, -1.00, 2, 'Auto Log'),
(136, 1, 'DISTANCE_UNAVAILABLE', '2026-09-20 22:05:55', 4022, -1.00, 2, 'Auto Log'),
(137, 1, 'BAD_POSTURE', '2026-09-20 22:05:57', 4001, 34.16, 2, 'Auto Log'),
(138, 1, 'BAD_POSTURE_ALERT', '2026-09-20 22:05:58', 3949, 41.62, 2, 'Auto Log'),
(139, 1, 'BAD_POSTURE', '2026-09-20 22:06:01', 3949, 41.62, 2, 'Auto Log'),
(140, 1, 'NO_SITTING', '2026-09-20 22:06:03', 0, 16.17, 2, 'Auto Log'),
(141, 1, 'NO_SITTING', '2026-09-20 22:06:05', 0, 16.82, 2, 'Auto Log'),
(142, 1, 'NO_SITTING', '2026-09-20 22:06:06', 0, -1.00, 2, 'Auto Log'),
(143, 1, 'NO_SITTING', '2026-09-20 22:06:08', 0, -1.00, 2, 'Auto Log'),
(144, 1, 'NO_SITTING', '2026-09-20 22:08:43', 0, 5.20, 2, 'Auto Log'),
(145, 1, 'NO_SITTING', '2026-09-20 22:08:44', 0, 5.20, 2, 'Auto Log'),
(146, 1, 'NO_SITTING', '2026-09-20 22:08:46', 0, 5.20, 2, 'Auto Log'),
(147, 1, 'NO_SITTING', '2026-09-20 22:08:47', 0, 5.20, 2, 'Auto Log'),
(148, 1, 'NO_SITTING', '2026-09-20 22:08:49', 0, 5.20, 2, 'Auto Log'),
(149, 1, 'NO_SITTING', '2026-09-20 22:08:50', 0, 5.20, 2, 'Auto Log'),
(150, 1, 'NO_SITTING', '2026-09-20 22:08:52', 0, 5.20, 2, 'Auto Log'),
(151, 1, 'NO_SITTING', '2026-09-20 22:08:53', 0, 5.20, 2, 'Auto Log'),
(152, 1, 'NO_SITTING', '2026-09-20 22:08:54', 0, 5.20, 2, 'Auto Log'),
(153, 1, 'NO_SITTING', '2026-09-20 22:08:56', 0, 5.20, 2, 'Auto Log'),
(154, 1, 'NO_SITTING', '2026-09-20 22:08:57', 0, 5.20, 2, 'Auto Log'),
(155, 1, 'NO_SITTING', '2026-09-20 22:08:58', 0, 5.20, 2, 'Auto Log'),
(156, 1, 'NO_SITTING', '2026-09-20 22:09:00', 0, 5.20, 2, 'Auto Log'),
(157, 1, 'NO_SITTING', '2026-09-20 22:09:07', 0, 5.20, 2, 'Auto Log'),
(158, 1, 'NO_SITTING', '2026-09-20 22:09:08', 0, 5.20, 2, 'Auto Log'),
(159, 1, 'NO_SITTING', '2026-09-20 22:09:09', 0, 5.20, 2, 'Auto Log'),
(160, 1, 'NO_SITTING', '2026-09-20 22:09:10', 0, 5.20, 2, 'Auto Log'),
(161, 1, 'NO_SITTING', '2026-09-20 22:09:12', 0, 5.20, 2, 'Auto Log'),
(162, 1, 'NO_SITTING', '2026-09-20 22:09:13', 0, 5.20, 2, 'Auto Log'),
(163, 1, 'NO_SITTING', '2026-09-20 22:09:15', 0, 5.20, 2, 'Auto Log'),
(164, 1, 'NO_SITTING', '2026-09-20 22:09:16', 0, 5.20, 2, 'Auto Log'),
(165, 1, 'NO_SITTING', '2026-09-20 22:09:17', 0, 5.20, 2, 'Auto Log'),
(166, 1, 'NO_SITTING', '2026-09-20 22:09:18', 0, 5.20, 2, 'Auto Log'),
(167, 1, 'NO_SITTING', '2026-09-20 22:09:20', 0, 5.20, 2, 'Auto Log'),
(168, 1, 'NO_SITTING', '2026-09-20 22:09:21', 0, 3.58, 2, 'Auto Log'),
(169, 1, 'NO_SITTING', '2026-09-20 22:09:22', 0, 5.20, 2, 'Auto Log'),
(170, 1, 'NO_SITTING', '2026-09-20 22:09:23', 0, 5.20, 2, 'Auto Log'),
(171, 1, 'NO_SITTING', '2026-09-20 22:09:25', 0, 5.20, 2, 'Auto Log'),
(172, 1, 'NO_SITTING', '2026-09-20 22:09:27', 0, 5.20, 2, 'Auto Log'),
(173, 1, 'NO_SITTING', '2026-09-20 22:09:29', 0, 4.54, 2, 'Auto Log'),
(174, 1, 'NO_SITTING', '2026-09-20 22:09:30', 0, 4.54, 2, 'Auto Log'),
(175, 1, 'NO_SITTING', '2026-09-20 22:09:31', 0, 3.60, 2, 'Auto Log'),
(176, 1, 'NO_SITTING', '2026-09-20 22:09:33', 0, 2.64, 2, 'Auto Log'),
(177, 1, 'NO_SITTING', '2026-09-20 22:09:34', 0, 3.60, 2, 'Auto Log'),
(178, 1, 'NO_SITTING', '2026-09-20 22:09:35', 0, 4.24, 2, 'Auto Log'),
(179, 1, 'NO_SITTING', '2026-09-20 22:09:36', 0, 5.20, 2, 'Auto Log'),
(180, 1, 'NO_SITTING', '2026-09-20 22:09:38', 0, 4.54, 2, 'Auto Log'),
(181, 1, 'NO_SITTING', '2026-09-20 22:09:39', 0, 7.75, 2, 'Auto Log'),
(182, 1, 'NO_SITTING', '2026-09-20 22:09:40', 0, 7.75, 2, 'Auto Log'),
(183, 1, 'NO_SITTING', '2026-09-20 22:09:44', 0, 9.09, 2, 'Auto Log'),
(184, 1, 'NO_SITTING', '2026-09-20 22:09:44', 0, 9.07, 2, 'Auto Log'),
(185, 1, 'NO_SITTING', '2026-09-20 22:09:45', 0, 9.09, 2, 'Auto Log'),
(186, 1, 'NO_SITTING', '2026-09-20 22:09:47', 0, 5.83, 2, 'Auto Log'),
(187, 1, 'NO_SITTING', '2026-09-20 22:09:48', 0, 2.95, 2, 'Auto Log'),
(188, 1, 'NO_SITTING', '2026-09-20 22:09:49', 0, 2.62, 2, 'Auto Log'),
(189, 1, 'NO_SITTING', '2026-09-20 22:09:50', 0, 2.32, 2, 'Auto Log'),
(190, 1, 'NO_SITTING', '2026-09-20 22:09:52', 0, 2.64, 2, 'Auto Log'),
(191, 1, 'NO_SITTING', '2026-09-20 22:09:54', 0, -1.00, 2, 'Auto Log'),
(192, 1, 'NO_SITTING', '2026-09-20 22:09:55', 0, 2.95, 2, 'Auto Log'),
(193, 1, 'NO_SITTING', '2026-09-20 22:09:57', 0, 2.32, 2, 'Auto Log'),
(194, 1, 'NO_SITTING', '2026-09-20 22:09:58', 0, 2.32, 2, 'Auto Log'),
(195, 1, 'NO_SITTING', '2026-09-20 22:09:59', 0, 2.32, 2, 'Auto Log'),
(196, 1, 'NO_SITTING', '2026-09-20 22:10:01', 0, -1.00, 2, 'Auto Log'),
(197, 1, 'NO_SITTING', '2026-09-20 22:10:02', 0, 2.95, 2, 'Auto Log'),
(198, 1, 'DISTANCE_UNAVAILABLE', '2026-09-20 22:10:03', 3726, -1.00, 2, 'Auto Log'),
(199, 1, 'POSTURE_OK', '2026-09-20 22:10:05', 3687, 3.60, 2, 'Auto Log'),
(200, 1, 'POSTURE_OK', '2026-09-20 22:10:06', 3629, 3.28, 2, 'Auto Log'),
(201, 1, 'POSTURE_OK', '2026-09-20 22:10:07', 3650, 11.78, 2, 'Auto Log'),
(202, 1, 'POSTURE_OK', '2026-09-20 22:10:08', 3654, 12.79, 2, 'Auto Log'),
(203, 1, 'POSTURE_OK', '2026-09-20 22:10:10', 3858, 11.78, 2, 'Auto Log'),
(204, 1, 'NO_SITTING', '2026-09-20 22:10:11', 0, 9.09, 2, 'Auto Log'),
(205, 1, 'NO_SITTING', '2026-09-20 22:10:13', 0, 13.12, 2, 'Auto Log'),
(206, 1, 'BAD_POSTURE', '2026-09-20 22:10:14', 3996, 50.35, 2, 'Auto Log'),
(207, 1, 'BAD_POSTURE', '2026-09-20 22:10:15', 4086, 16.82, 2, 'Auto Log'),
(208, 1, 'BAD_POSTURE_ALERT', '2026-09-20 22:10:16', 3871, 16.82, 2, 'Auto Log'),
(209, 1, 'BAD_POSTURE', '2026-09-20 22:10:21', 3871, 16.82, 2, 'Auto Log'),
(210, 1, 'BAD_POSTURE', '2026-09-20 22:10:21', 4073, 16.82, 2, 'Auto Log'),
(211, 1, 'BAD_POSTURE', '2026-09-20 22:10:22', 4072, 16.82, 2, 'Auto Log'),
(212, 1, 'BAD_POSTURE', '2026-09-20 22:10:33', 4095, 16.81, 2, 'Auto Log'),
(213, 1, 'NO_SITTING', '2026-09-20 22:10:34', 0, 16.82, 2, 'Auto Log'),
(214, 1, 'NO_SITTING', '2026-09-20 22:10:36', 0, 12.45, 2, 'Auto Log'),
(215, 1, 'NO_SITTING', '2026-09-20 22:39:47', 0, 11.11, 2, 'Auto Log'),
(216, 1, 'POSTURE_OK', '2026-09-20 22:39:49', 4014, 9.42, 2, 'Auto Log'),
(217, 1, 'POSTURE_OK', '2026-09-20 22:39:50', 4095, 11.11, 2, 'Auto Log'),
(218, 1, 'POSTURE_OK', '2026-09-20 22:39:52', 4095, 11.11, 2, 'Auto Log'),
(219, 1, 'BAD_POSTURE', '2026-09-20 22:39:53', 4095, 16.17, 2, 'Auto Log'),
(220, 1, 'POSTURE_OK', '2026-09-20 22:39:54', 4095, 12.79, 2, 'Auto Log'),
(221, 1, 'POSTURE_OK', '2026-09-20 22:39:55', 4095, 9.78, 2, 'Auto Log'),
(222, 1, 'POSTURE_OK', '2026-09-20 22:39:57', 4095, 9.76, 2, 'Auto Log'),
(223, 1, 'POSTURE_OK', '2026-09-20 22:39:58', 4095, 9.42, 2, 'Auto Log'),
(224, 1, 'POSTURE_OK', '2026-09-20 22:39:59', 4095, 11.46, 2, 'Auto Log'),
(225, 1, 'BAD_POSTURE', '2026-09-20 22:40:01', 4085, 16.82, 2, 'Auto Log'),
(226, 1, 'DISTANCE_UNAVAILABLE', '2026-09-20 22:40:03', 4095, -1.00, 2, 'Auto Log'),
(227, 1, 'DISTANCE_UNAVAILABLE', '2026-09-20 22:40:04', 4095, -1.00, 2, 'Auto Log'),
(228, 1, 'POSTURE_OK', '2026-09-20 22:40:06', 4095, 9.09, 2, 'Auto Log'),
(229, 1, 'POSTURE_OK', '2026-09-20 22:40:07', 4095, 9.09, 2, 'Auto Log'),
(230, 1, 'BAD_POSTURE', '2026-09-20 22:40:08', 4095, 19.74, 2, 'Auto Log'),
(231, 1, 'DISTANCE_UNAVAILABLE', '2026-09-20 22:40:10', 4095, -1.00, 2, 'Auto Log'),
(232, 1, 'DISTANCE_UNAVAILABLE', '2026-09-20 22:40:11', 4076, -1.00, 2, 'Auto Log'),
(233, 1, 'BAD_POSTURE', '2026-09-20 22:40:12', 4086, 43.87, 2, 'Auto Log'),
(234, 1, 'POSTURE_OK', '2026-09-20 22:40:14', 4095, 12.13, 2, 'Auto Log'),
(235, 1, 'POSTURE_OK', '2026-09-20 22:40:15', 4089, 12.11, 2, 'Auto Log'),
(236, 1, 'POSTURE_OK', '2026-09-20 22:40:16', 4095, 10.77, 2, 'Auto Log'),
(237, 1, 'POSTURE_OK', '2026-09-20 22:40:18', 4095, 10.77, 2, 'Auto Log'),
(238, 1, 'BAD_POSTURE', '2026-09-20 22:40:19', 4095, 16.50, 2, 'Auto Log'),
(239, 1, 'BAD_POSTURE', '2026-09-20 22:40:20', 4095, 16.17, 2, 'Auto Log'),
(240, 1, 'BAD_POSTURE_ALERT', '2026-09-20 22:40:21', 4095, 16.17, 2, 'Auto Log'),
(241, 1, 'BAD_POSTURE', '2026-09-20 22:40:23', 4095, 16.17, 2, 'Auto Log'),
(242, 1, 'BAD_POSTURE', '2026-09-20 22:40:24', 4095, 16.16, 2, 'Auto Log'),
(243, 1, 'BAD_POSTURE_ALERT', '2026-09-20 22:40:26', 4095, 16.17, 2, 'Auto Log'),
(244, 1, 'BAD_POSTURE', '2026-09-20 22:40:28', 4095, 16.17, 2, 'Auto Log'),
(245, 1, 'BAD_POSTURE', '2026-09-20 22:40:29', 4095, 16.17, 2, 'Auto Log'),
(246, 1, 'BAD_POSTURE_ALERT', '2026-09-20 22:40:30', 4031, 16.17, 2, 'Auto Log'),
(247, 1, 'BAD_POSTURE', '2026-09-20 22:40:33', 4031, 16.17, 2, 'Auto Log'),
(248, 1, 'NO_SITTING', '2026-09-20 22:40:34', 0, 17.15, 2, 'Auto Log');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `devices`
--
ALTER TABLE `devices`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `posture_events`
--
ALTER TABLE `posture_events`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `posture_events`
--
ALTER TABLE `posture_events`
  MODIFY `id` int(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=249;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
