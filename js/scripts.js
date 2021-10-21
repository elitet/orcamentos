/*!
 * Start Bootstrap - Bare v5.0.7 (https://startbootstrap.com/template/bare)
 * Copyright 2013-2021 Start Bootstrap
 * Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-bare/blob/master/LICENSE)
 */
// This file is intentionally blank
// Use this file to add JavaScript to your project

$(document).ready(function () {

    createDatabase();

    var getParentAnchor = function (element) {
        while (element !== null) {
            if (element.ariaLabel && element.tagName.toUpperCase() === "A") {
                return element;
            }
            element = element.parentNode;
        }
        return null;
    };

    document.querySelector("body").addEventListener('click', function (e) {
        //e.preventDefault();
        var anchor = getParentAnchor(e.target);

        if (anchor !== null) {

            const existingElements = document.querySelectorAll(".lMenu");
            const elmSel = Array.from(existingElements).filter(chapter => chapter.classList.contains("active"))

            elmSel[0].classList.remove("active")
            anchor.classList.add("active");
            pages(anchor.ariaLabel)
        }
    }, false);

});

let pages = (page) => {
    $('#main').load('/pages/' + page + '.html');
}


function createDatabase() {
    try {
        if (window.openDatabase) {
            var shortName = 'db_xyz';
            var version = '1.0';
            var displayName = 'Display Information';
            var maxSize = 65536; // in bytes
            db = openDatabase(shortName, version, displayName, maxSize);
        }

        createTable();

    } catch (e) {
        alert(e);
    }
}

function getBase64(file) {
    var reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function () {
        return (reader.result);
    };
    reader.onerror = function (error) {
        console.log('Error: ', error);
    };
}

function executeQuery($query, callback) {
    try {
        if (window.openDatabase) {
            db.transaction(
                function (tx) {
                    tx.executeSql($query, [], function (tx, result) {
                        if (typeof (callback) == "function") {
                            callback(result);
                        } else {
                            if (callback != undefined) {
                                eval(callback + "(result)");
                            }
                        }
                    }, function (tx, error) {});
                });
            //return rslt;
        }
    } catch (e) {
        console.log(e)
    }
}

function showTable() {
    executeQuery('select * from empresa', (s) => {
        console.log(s)
    })
}

function createTable() {
    //var sql = 'drop table empresa';
    //executeQuery(sql);
    var sqlC = `CREATE TABLE empresa (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, 
                                                     nome TEXT NOT NULL,
                                                     email TEXT NOT NULL,
                                                     telefone TEXT NOT NULL,
                                                     website TEXT NOT NULL,
                                                     instagram TEXT NOT NULL,
                                                     facebook TEXT NOT NULL,
                                                     image BLOB
                )`;
    executeQuery(sqlC);
}

function insertValue() {
    var img = document.getElementById('image');
    var reader = new FileReader();

    reader.readAsDataURL(document.querySelector('#image').files[0]);

    let img64 = "";

    reader.onload = function () {
        img64 = reader.result;

        console.log(img64)

        var sql = 'insert into image (name,image) VALUES ("sujeet","' + img64 + '")';
        executeQuery(sql, function (results) {
            alert(results)
        });

    };


}

let saveEmpresa = () => {
    let emp = $("form").serializeJSON()

    let sql = ""

    executeQuery('select * from empresa', (s) => {
        if (s.rows.length > 0)
            sql = `UPDATE empresa SET nome = '${emp.empNome}', email = '${emp.empEmail}', telefone = '${emp.empTelefone}', website = '${emp.empSite}', instagram = '${emp.empInsta}', facebook = '${emp.empFacebook}' WHERE id = ${s.rows[0].id}`
        else
            sql = `INSERT INTO empresa (nome, email, telefone, website, instagram, facebook) VALUES ('${emp.empNome}', '${emp.empEmail}', '${emp.empTelefone}', '${emp.empSite}', '${emp.empInsta}', '${emp.empFacebook}')`
        executeQuery(sql)
    })
}
