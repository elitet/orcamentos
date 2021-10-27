/*!
 * Start Bootstrap - Bare v5.0.7 (https://startbootstrap.com/template/bare)
 * Copyright 2013-2021 Start Bootstrap
 * Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-bare/blob/master/LICENSE)
 */
// This file is intentionally blank
// Use this file to add JavaScript to your project

let pageParam = null

accounting.settings = {
	currency: {
		symbol : "R$",   // default currency symbol is '$'
		format: "%s%v", // controls output: %s = symbol, %v = value/number (can be object: see below)
		decimal : ",",  // decimal point separator
		thousand: ".",  // thousands separator
		precision : 2   // decimal places
	},
	number: {
		precision : 0,  // default precision on numbers is 0
		thousand: ".",
		decimal : ","
	}
}

$(document).ready(function () {

    createDatabase();

    var getParentAnchor = function (element) {
        while (element !== null) {
            if (element.dataset && element.tagName.toUpperCase() === "A") {
                return element;
            }
            element = element.parentNode;
        }
        return null;
    };

    document.querySelector("body").addEventListener('click', function (e) {
        //e.preventDefault();
        let anchor = getParentAnchor(e.target);

        if (anchor !== null) {
            const existingElements = document.querySelectorAll(".lMenu");
            const elmSel = Array.from(existingElements).filter(chapter => {
                                if(chapter.classList.contains("active") && anchor.dataset.current != chapter.dataset.page)
                                    return chapter
                            })

            if (elmSel.length > 0)
                elmSel[0].classList.remove("active")

            //if (anchor.dataset.param != undefined || anchor.dataset.param != null)
             //   param = anchor.dataset.param
            
            pageParam = anchor.dataset.param == undefined ? "" : anchor.dataset.param
            
            anchor.classList.add("active");
            pages(anchor.dataset.page)
        }
    }, false);

    document.querySelector("[data-page='orcamentos']").click()

});

let SPMaskBehavior = function (val) {
        return val.replace(/\D/g, '').length === 11 ? '(00) 00000-0000' : '(00) 0000-00009';
    },
    spOptions = {
    onKeyPress: function(val, e, field, options) {
        field.mask(SPMaskBehavior.apply({}, arguments), options);
        }
    };

let formatDate = (data) => {
        dia  = data.getDate().toString(),
        diaF = (dia.length == 1) ? '0'+dia : dia,
        mes  = (data.getMonth()+1).toString(), //+1 pois no getMonth Janeiro começa com zero.
        mesF = (mes.length == 1) ? '0'+mes : mes,
        anoF = data.getFullYear();
    return diaF+"/"+mesF+"/"+anoF;
}

const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer)
      toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
  })

let pages = (page) => {

    if (page != 'produtoForm' && page != 'clienteForm')
        pageParam = ""

    $('#main').load(`/pages/${page}.html`);
}

let orcamentosProdutos = []

let row = `<tr>
                    <th scope="row">{{id}}</th>
                    <td>{{nome}}</td>
                    <td>{{valor}}</td>
                    <td>{{unidade}}</td>
                    <td class="text-center">
                            <a href="#" class="btn btn-outline-primary btn-circle" data-page="produtoForm" data-current="produtos" data-param="{{id}}"><i class="fas fa-edit"></i></a>
                            <button type="button" class="btn btn btn-outline-danger btn-circle" onclick="deleteProduto({{id}})"><i class="fas fa-trash"></i></button>
                    </td>
               </tr>`

let rowCliente = `<tr>
                    <th scope="row">{{id}}</th>
                    <td>{{nome}}</td>
                    <td>{{telefone}}</td>
                    <td>{{endereco}}</td>
                    <td class="text-center">
                            <a href="#" class="btn btn-outline-primary btn-circle" data-page="clienteForm" data-current="clientes" data-param="{{id}}"><i class="fas fa-edit"></i></a>
                            <button type="button" class="btn btn btn-outline-danger btn-circle" onclick="deleteCliente({{id}})"><i class="fas fa-trash"></i></button>
                    </td>
               </tr>`               

let optionCliente = `<option value="{{id}}">{{nome}} - {{telefone}}</option>`

let rowOrcamentoProd = `<div class="row mb-3" id="orcamentoProd-{{id}}">
                        <div class="col">
                            <p class="fs-6 fw-bolder text-wrap mb-1" style="width: 17rem;">{{descricao}}</p>
                            <p class="fs-6 mb-2 text-muted">{{valor}}</p>
                        </div>

                        <div class="col-3">
                            <div class="input-group mb-2">
                                <button class="btn btn-outline-secondary" type="button" onclick="updateQtd({{id}},-1)"><i class="fa-solid fa-minus"></i></button>
                                <input type="text" class="form-control text-center" id="quantidadeProd-{{id}}" onblur="updateQtd({{id}},Number(this.value), 'D')" value="1">
                                <button class="btn btn-outline-secondary" type="button" onclick="updateQtd({{id}},1)"><i class="fa-solid fa-plus"></i></button>
                            </div>
                            
                            <p class="text-center mb-0">
                                <span href="#" onclick="removeProd({{id}})" style="cursor:pointer;"><i class="fa-solid fa-trash text-danger"></i></span>
                            </p>

                        </div>               
                        
                        <div class="col-3">
                            <p class="fs-6 fw-bolder text-center sumTotal" id="totalProd-{{id}}">R$ 0,00</p>
                        </div>
                            
                        <hr class="mx-auto mt-2" style="width: 40rem;">
                            
                    </div>`

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
                    }, function (tx, error) {
                        console.log(error)
                        Swal.fire({
                            icon: 'error',
                            title: 'Oops...',
                            text: 'Algo deu errado, tente novamente mais tarde.',
                            //footer: '<a href="">Porque estou vendo isso?</a>'
                          })
                    });
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
    //var sql = 'drop table clientes';
    //executeQuery(sql);

    executeQuery(`SELECT name FROM sqlite_master WHERE type='table' AND name='empresa'`, (s) => {
        if (s.rows.length == 0){
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
    })

    executeQuery(`SELECT name FROM sqlite_master WHERE type='table' AND name='produtos'`, (s) => {
        if (s.rows.length == 0){
            var sqlC = `CREATE TABLE produtos (prodid INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, 
                                                            nome TEXT NOT NULL,
                                                            valor DOUBLE(10,2) NOT NULL,
                                                            unidade TEXT NOT NULL
                        )`;
            executeQuery(sqlC);
        }
    })

    executeQuery(`SELECT name FROM sqlite_master WHERE type='table' AND name='clientes'`, (s) => {
        if (s.rows.length == 0){
            var sqlC = `CREATE TABLE clientes (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, 
                                                            nome TEXT NOT NULL,
                                                            cep TEXT NOT NULL,
                                                            endereco TEXT NOT NULL,
                                                            numero TEXT NOT NULL,
                                                            bairro TEXT NOT NULL,
                                                            complemento TEXT,
                                                            cidade TEXT NOT NULL,
                                                            estado TEXT NOT NULL,
                                                            telefone TEXT NOT NULL,
                                                            email TEXT,
                                                            observacao TEXT
                        )`;
            executeQuery(sqlC);
        }
    })
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

let emptyFields = () => Array.from(document.querySelectorAll("[required]")).filter(s => {
                                        if(s.value.trim().length == 0)
                                            return s
                                    }).length                              

let saveEmpresa = () => {
    if(emptyFields() == 0){

        let emp = $("form").serializeJSON()

        let sql = ""

        executeQuery('select * from empresa', (s) => {
            if (s.rows.length > 0)
                sql = `UPDATE empresa SET nome = '${emp.empNome}', email = '${emp.empEmail}', telefone = '${emp.empTelefone}', website = '${emp.empSite}', instagram = '${emp.empInsta}', facebook = '${emp.empFacebook}' WHERE id = ${s.rows[0].id}`
            else
                sql = `INSERT INTO empresa (nome, email, telefone, website, instagram, facebook) VALUES ('${emp.empNome}', '${emp.empEmail}', '${emp.empTelefone}', '${emp.empSite}', '${emp.empInsta}', '${emp.empFacebook}')`
            
            executeQuery(sql, (e) => {
                console.log(e)

                Toast.fire({
                    icon: 'success',
                    title: 'Dados foram salvos com sucesso!'
                })

                document.querySelector("[data-page='empresa']").click()

            })
        })

    }else{
        Swal.fire(
            'Atenção!',
            'Voçê deve preencher os campos obrigatórios!',
            'warning'
        )
    }
}


let deleteEmpresa = () => {

    Swal.fire({
        title: 'Você deseja apagar os dados?',
        text: "Isto é uma ação irreversível!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sim, apagar'
      }).then((result) => {
        if (result.isConfirmed) {

            executeQuery('delete from empresa', (e) => {
                document.querySelector("form").reset()
                
                Swal.fire(
                    'Apagado!',
                    'Os dados foram deletados com sucesso.',
                    'success'
                )
                
                document.querySelector("[data-page='empresa']").click()
            })

        }
      })

}


let saveProduto = (prodId) => {
    if(emptyFields() == 0){

        let emp = $("form").serializeJSON()

        let valorN = accounting.unformat(emp.prodValor, ",") //Number(emp.prodValor.replace(/[^0-9,-]+/g,""))

        let sql = ""

        
        if (prodId.length > 0)
            sql = `UPDATE produtos SET nome = '${emp.prodNome}', valor = ${valorN}, unidade = '${emp.prodUnid}' WHERE prodid = ${prodId}`
        else
            sql = `INSERT INTO produtos (nome, valor, unidade) VALUES ('${emp.prodNome}', ${valorN}, '${emp.prodUnid}')`
        
        executeQuery(sql, (e) => {
            console.log(e)

            Toast.fire({
                icon: 'success',
                title: 'Dados foram salvos com sucesso!'
            })

            document.querySelector("a[data-page=produtos]").click()

        })    

    }else{
        Swal.fire(
            'Atenção!',
            'Voçê deve preencher os campos obrigatórios!',
            'warning'
        )
    }
}

let deleteProduto = (id) => {

    Swal.fire({
        title: 'Você deseja apagar os dados?',
        text: "Isto é uma ação irreversível!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sim, apagar'
      }).then((result) => {
        if (result.isConfirmed) {

            executeQuery(`delete from produtos where prodid = ${id}`, (e) => {
                
                Swal.fire(
                    'Apagado!',
                    'Os dados foram deletados com sucesso.',
                    'success'
                )
                
                document.querySelector("[data-page='produtos']").click()
            })

        }
      })

}

let requestAPI = (url) => {

    return fetch(url)
    .then((response) => response)
    .then((responseData) => {
      return responseData;
    })
        .catch(error => console.warn(error));
    
}

let saveCliente = (clienteId) => {
    if(emptyFields() == 0){

        let emp = $("form").serializeJSON()

        let sql = ""

        if (clienteId != null)
            sql = `UPDATE clientes SET
                    nome = '${emp.cliNome}', 
                    cep = '${emp.cliCep}', 
                    endereco = '${emp.cliEnd}',
                    numero = '${emp.cliNumero}',
                    bairro = '${emp.cliBairro}',
                    complemento = '${emp.cliComp}',
                    cidade = '${emp.cliCidade}',
                    estado = '${emp.cliEstado}',
                    telefone = '${emp.cliCelular}',
                    email = '${emp.cliEmail}',
                    observacao = '${emp.cliObs}'
                WHERE id = ${clienteId}`
        else
            sql = `INSERT INTO clientes 
                    (nome, cep, endereco, numero, bairro, complemento, cidade, estado, telefone, email, observacao) VALUES
                    ('${emp.cliNome}', 
                    '${emp.cliCep}', 
                    '${emp.cliEnd}',
                    '${emp.cliNumero}',
                    '${emp.cliBairro}',
                    '${emp.cliComp}',
                    '${emp.cliCidade}',
                    '${emp.cliEstado}',
                    '${emp.cliCelular}',
                    '${emp.cliEmail}',
                    '${emp.cliObs}')`
        
        executeQuery(sql, (e) => {
            console.log(e)

            Toast.fire({
                icon: 'success',
                title: 'Dados foram salvos com sucesso!'
            })

            document.querySelector("a[data-page=clientes]").click()

        })    

    }else{
        Swal.fire(
            'Atenção!',
            'Voçê deve preencher os campos obrigatórios!',
            'warning'
        )
    }
}

let deleteCliente = (id) => {

    Swal.fire({
        title: 'Você deseja apagar os dados?',
        text: "Isto é uma ação irreversível!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sim, apagar'
      }).then((result) => {
        if (result.isConfirmed) {

            executeQuery(`delete from clientes where id = ${id}`, (e) => {
                
                Swal.fire(
                    'Apagado!',
                    'Os dados foram deletados com sucesso.',
                    'success'
                )
                
                document.querySelector("[data-page='clientes']").click()
            })

        }
      })

}

let updateQtd = (id, qtde, tipo) => {
    let qtdeT = 0

    if (tipo == 'D')
        qtdeT = qtde
    else
        qtdeT = Number(document.getElementById(`quantidadeProd-${id}`).value) + qtde

    if (qtdeT > 0) {
        document.getElementById(`quantidadeProd-${id}`).value = qtdeT
        calcTotalProd(id)
        sumTotal()
    }
}
    
let calcTotalProd = (id) => {

    let qtde = Number(document.getElementById(`quantidadeProd-${id}`).value)
    let valor = orcamentosProdutos.filter(e => e.value == id)[0].valor
    let unid = orcamentosProdutos.filter(e => e.value == id)[0].unidade

    let totalProd = 0

    if(qtde > 0){
        totalProd = valor * qtde
    }
        
    document.getElementById(`totalProd-${id}`).innerHTML = accounting.formatMoney(totalProd, "R$ ") + ` <span class="text-muted" style=" font-size: .8rem !important; ">/${unid}</span>`
    
    sumTotal()

}
    
let sumTotal = () => {
    let total = 0

    Array.from(document.getElementsByClassName('sumTotal')).map(e => {
        total += accounting.unformat(e.innerText, ",")
    })

    document.getElementById("totalOrcametno").innerHTML = accounting.formatMoney(total, "R$ ")
}

let removeProd = (id) => {
    document.getElementById(`orcamentoProd-${id}`).remove()
    sumTotal()
}
