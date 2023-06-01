-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Dec 13, 2022 at 05:52 PM
-- Server version: 10.4.25-MariaDB
-- PHP Version: 7.4.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `software`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin`
--

CREATE TABLE `admin` (
  `Name` varchar(100) NOT NULL,
  `Email` varchar(100) NOT NULL,
  `Admin_id` varchar(100) NOT NULL,
  `Password` varchar(100) NOT NULL,
  `Securecode` varchar(100) NOT NULL,
  `Phone_Number` varchar(10) NOT NULL,
  `Gender` varchar(100) NOT NULL,
  `Address` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `admin`
--

INSERT INTO `admin` (`Name`, `Email`, `Admin_id`, `Password`, `Securecode`, `Phone_Number`, `Gender`, `Address`) VALUES
('Aritra Dutta', 'aritra@gmail.com', '1234567', '12345', 'aritra', '9875380964', 'Male', '85/2, Rajendra Avenue, Uttarpara, Hooghly');

-- --------------------------------------------------------

--
-- Table structure for table `attendance`
--

CREATE TABLE `attendance` (
  `Roll` int(100) NOT NULL,
  `Class` bigint(100) NOT NULL,
  `Date` date NOT NULL,
  `Name` varchar(100) NOT NULL,
  `Email` varchar(100) NOT NULL,
  `Status` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `feedetails`
--

CREATE TABLE `feedetails` (
  `Fees` varchar(100) NOT NULL,
  `Class` bigint(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `feedetails`
--

INSERT INTO `feedetails` (`Fees`, `Class`) VALUES
('10000', 11),
('20000', 12);

-- --------------------------------------------------------

--
-- Table structure for table `paymentdetails`
--

CREATE TABLE `paymentdetails` (
  `Transaction_Id` varchar(100) NOT NULL,
  `Roll` int(100) NOT NULL,
  `Class` bigint(100) NOT NULL,
  `Fees` varchar(100) NOT NULL,
  `Pay_Date` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `student1`
--

CREATE TABLE `student1` (
  `Roll` int(100) NOT NULL,
  `Name` varchar(100) NOT NULL,
  `Class` bigint(100) NOT NULL,
  `Email` varchar(100) NOT NULL,
  `Phone_Number` varchar(100) NOT NULL,
  `Address` varchar(100) NOT NULL,
  `Blood_Group` varchar(100) NOT NULL,
  `Gender` varchar(100) NOT NULL,
  `DOB` date NOT NULL,
  `Payment` varchar(100) NOT NULL DEFAULT 'NOT PAID'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `student1`
--

INSERT INTO `student1` (`Roll`, `Name`, `Class`, `Email`, `Phone_Number`, `Address`, `Blood_Group`, `Gender`, `DOB`, `Payment`) VALUES
(2054088, 'Aritra', 12, 'aritra.dutta.it24@heritageit.edu.in', '1234566', '85/2 Rajendra Avenue Uttarpara Hooghly', 'AB+', 'Male', '2022-11-11', 'NOT PAID');

-- --------------------------------------------------------

--
-- Table structure for table `student_info`
--

CREATE TABLE `student_info` (
  `Roll` int(100) NOT NULL,
  `Class` int(100) NOT NULL,
  `Password` varchar(100) NOT NULL,
  `Securecode` varchar(100) NOT NULL,
  `Name` varchar(100) NOT NULL,
  `Email` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `student_info`
--

INSERT INTO `student_info` (`Roll`, `Class`, `Password`, `Securecode`, `Name`, `Email`) VALUES
(2054088, 12, '1234', 'aritra11', 'Aritra', 'aritra.dutta.it24@heritageit.edu.in');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin`
--
ALTER TABLE `admin`
  ADD PRIMARY KEY (`Admin_id`);

--
-- Indexes for table `attendance`
--
ALTER TABLE `attendance`
  ADD PRIMARY KEY (`Roll`,`Class`,`Date`),
  ADD KEY `Foreign Key` (`Email`);

--
-- Indexes for table `feedetails`
--
ALTER TABLE `feedetails`
  ADD PRIMARY KEY (`Fees`),
  ADD KEY `Class` (`Class`);

--
-- Indexes for table `paymentdetails`
--
ALTER TABLE `paymentdetails`
  ADD PRIMARY KEY (`Transaction_Id`),
  ADD KEY `Class` (`Class`);

--
-- Indexes for table `student1`
--
ALTER TABLE `student1`
  ADD PRIMARY KEY (`Roll`,`Class`),
  ADD KEY `Email` (`Email`);

--
-- Indexes for table `student_info`
--
ALTER TABLE `student_info`
  ADD PRIMARY KEY (`Email`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `attendance`
--
ALTER TABLE `attendance`
  ADD CONSTRAINT `Foreign Key` FOREIGN KEY (`Email`) REFERENCES `student_info` (`Email`);

--
-- Constraints for table `student1`
--
ALTER TABLE `student1`
  ADD CONSTRAINT `student1_ibfk_1` FOREIGN KEY (`Email`) REFERENCES `student_info` (`Email`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
