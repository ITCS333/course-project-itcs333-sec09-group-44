<!--
  Task 1 – Logout Script
  Student: Ajlan Isa Ajlan Ramadhan  ID: 202303872  Group: 44
-->
<?php
session_start();
session_unset();
session_destroy();

header("Location: login.php");
exit();
?>
