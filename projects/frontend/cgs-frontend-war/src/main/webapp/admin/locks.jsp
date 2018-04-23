<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt"%>
<!DOCTYPE html>
<html>
  <head>
    <title>CGS Admin console</title>
    <!-- Bootstrap -->
    <link href="css/locks.css" rel="stylesheet">
    <link href="css/table.css" rel="stylesheet">
  </head>
  <body>
    <h1>CGS Admin console</h1>
        <table>
            <thead>
                <tr>
                    <th>Entity Type</th>
                    <th>Entity ID</th>
                    <th>User Name</th>
                    <th>User Email</th>
                    <th>Acquire date</th>
                    <th></th>
                </tr>
            </thead>
            <c:forEach var="lock" items="${locks}">
                <tr>
                    <td>${lock.entityType.name}</td>
                    <td>${lock.entityId}</td>
                    <td>${lock.userName}</td>
                    <td>${lock.userEmail}</td>
                    <td><fmt:formatDate value="${lock.lockDate}" pattern="yyyy-MM-dd HH:mm:ss" /></td>
                    <td><a href="releaseLock?entityId=${lock.entityId}&entityType=${lock.entityType.name}">Release</a></td>
                </tr>
            </c:forEach>
        </table>
  </body>
</html>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt"%>
<!DOCTYPE html>
<html>
  <head>
    <title>CGS Admin console</title>
    <!-- Bootstrap -->
    <link href="css/locks.css" rel="stylesheet">
    <link href="css/table.css" rel="stylesheet">
  </head>
  <body>
    <h1>CGS Admin console</h1>
        <table>
            <thead>
                <tr>
                    <th>Entity Type</th>
                    <th>Entity ID</th>
                    <th>User Name</th>
                    <th>User Email</th>
                    <th>Acquire date</th>
                    <th></th>
                </tr>
            </thead>
            <c:forEach var="lock" items="${locks}">
                <tr>
                    <td>${lock.entityType.name}</td>
                    <td>${lock.entityId}</td>
                    <td>${lock.userName}</td>
                    <td>${lock.userEmail}</td>
                    <td><fmt:formatDate value="${lock.lockDate}" pattern="yyyy-MM-dd HH:mm:ss" /></td>
                    <td><a href="releaseLock?entityId=${lock.entityId}&entityType=${lock.entityType.name}">Release</a></td>
                </tr>
            </c:forEach>
        </table>
  </body>
</html>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt"%>
<!DOCTYPE html>
<html>
  <head>
    <title>CGS Admin console</title>
    <!-- Bootstrap -->
    <link href="css/locks.css" rel="stylesheet">
    <link href="css/table.css" rel="stylesheet">
  </head>
  <body>
    <h1>CGS Admin console</h1>
        <table>
            <thead>
                <tr>
                    <th>Entity Type</th>
                    <th>Entity ID</th>
                    <th>User Name</th>
                    <th>User Email</th>
                    <th>Acquire date</th>
                    <th></th>
                </tr>
            </thead>
            <c:forEach var="lock" items="${locks}">
                <tr>
                    <td>${lock.entityType.name}</td>
                    <td>${lock.entityId}</td>
                    <td>${lock.userName}</td>
                    <td>${lock.userEmail}</td>
                    <td><fmt:formatDate value="${lock.lockDate}" pattern="yyyy-MM-dd HH:mm:ss" /></td>
                    <td><a href="releaseLock?entityId=${lock.entityId}&entityType=${lock.entityType.name}">Release</a></td>
                </tr>
            </c:forEach>
        </table>
  </body>
</html>
