var tblProducts;
var select_client, select_search_product;
var tblSearchProducts;
var row_products;

var sale = {
    details: {
        subtotal: 0.00,
        iva: 0.00,
        ganancia: 0.00,
        total: 0.00,
        products: []
    },
    calculoAtributos: function(atributos = []) {
        if (!Array.isArray(atributos)) {
            return 0;
        }
        var sumaCosto = 0;

        atributos.forEach(function(value) {
            if (value && typeof value.precio === 'number') {
                sumaCosto += value.precio;
            }
        });
        return sumaCosto;
    },
    getProductsIds: function () {
        return this.details.products.map(value => value.id);
    },
    calculateInvoice: function () {
        var subtotal = 0.00;
        var iva = $('input[name="iva"]').val();
        var ganancia = $('input[name="ganancia"]').val();
        this.details.products.forEach(function (value, index, array) {
            value.index = index;
            value.cant = parseInt(value.cant);
            value.precio = sale.calculoAtributos(value.atributos);
            value.subtotal = value.cant * value.precio;
            subtotal += value.subtotal;
        });

        this.details.subtotal = subtotal;
        this.details.iva = this.details.subtotal * iva / 100;
        this.details.ganancia = this.details.subtotal * ganancia / 100;
        this.details.total = this.details.subtotal + this.details.iva + this.details.ganancia;

        $('input[name="subtotal"]').val(this.details.subtotal.toFixed(2));
        $('input[name="ivacalc"]').val(this.details.iva.toFixed(2));
        $('input[name="gananciacalc"]').val(this.details.ganancia.toFixed(2));
        $('input[name="total"]').val(this.details.total.toFixed(2));
    },
    addProduct: function (item) {
        this.details.products.push(item);
        this.listProducts();
    },
    listProducts: function () {
        this.calculateInvoice();
        tblProducts = $('#tblProducts').DataTable({
            responsive: true,
            autoWidth: false,
            destroy: true,
            data: this.details.products,
            columns: [
                {"data": "id"},
                {"data": "full_name"},
                {"data": "precio"},
                {"data": "cant"},
                {"data": "subtotal"},
            ],
            columnDefs: [
                {
                    targets: [-4],
                    class: 'text-center',
                },
                {
                    targets: [0],
                    class: 'text-center',
                    orderable: false,
                    render: function (data, type, row) {
                        return '<a rel="remove" class="btn btn-danger btn-xs btn-flat" style="color: white;">' +
                               '<i class="fas fa-trash-alt"></i></a> ' +
                               '<a rel="atributo" class="btn btn-secondary btn-xs btn-flat" style="color: white;">' +
                               '<i class="fas fa-list"></i></a>';
                    }
                },
                {
                    targets: [-3],
                    class: 'text-center',
                    orderable: false,
                    render: function (data, type, row) {
                        return '$' + parseFloat(data).toFixed(2);
                    }
                },
                {
                    targets: [-2],
                    class: 'text-center',
                    orderable: false,
                    render: function (data, type, row) {
                        return '<input type="text" name="cant" class="form-control form-control-sm input-sm" autocomplete="off" value="' + row.cant + '">';
                    }
                },
                {
                    targets: [-1],
                    class: 'text-center',
                    orderable: false,
                    render: function (data, type, row) {
                        return '$' + parseFloat(data).toFixed(2);
                    }
                },
            ],
            rowCallback(row, data, displayNum, displayIndex, dataIndex) {

                $(row).find('input[name="cant"]').TouchSpin({
                    min: 1,
                    max: 1000000,
                    step: 1
                });

            },
            initComplete: function (settings, json) {

            }
        });
    },
    formatAtributoRowHtml: function (d) {
        var html = '<table class="table" id="lblAtributos">';
        html += '<thead class="thead-dark">';
        html += '<tr><th scope="col">Atributo del Producto</th>';
        html += '<th scope="col">Costo</th>';
        html += '</thead>';
        html += '<tbody>';
        $.each(d.atributos, function (key, value) {
            html += '<tr>';
            html += '<td>' + value.atributo + '</td>';
            html += '<td><input type="number" name="importe-atributo" class="form-control form-control-sm input-sm" ' +
                'autocomplete="off" min="0" value="' + (typeof value.precio !== 'undefined' ? value.precio : "0.00") + '"></td>';
            html += '</tr>';
        });
        html += '<div class="form-group">';
        html += '<textarea class="form-control" rows="3" name="observaciones" placeholder="ej: Medidas 2mts x 1.60mts">';
        // Verificar si d.observaciones está definido antes de concatenarlo
        if (typeof d.observaciones !== 'undefined' && d.observaciones !== null) {
            html += d.observaciones;
        }else
        {
            html += '';
        }
        html += '</textarea>';
        html += '</div>';
        return html;
    },

};

$(function () {

    select_client = $('select[name="client"]');
    select_search_product = $('select[name="search_product"]');

    $('.select2').select2({
        theme: "bootstrap4",
        language: 'es'
    });

    // Client

    select_client.select2({
        theme: "bootstrap4",
        language: 'es',
        allowClear: true,
        ajax: {
            delay: 250,
            type: 'POST',
            url: pathname,
            headers: {
                'X-CSRFToken': csrftoken
            },
            data: function (params) {
                return {
                    term: params.term,
                    action: 'search_client'
                };
            },
            processResults: function (data) {
                return {
                    results: data
                };
            },
        },
        placeholder: 'Ingrese una descripción',
        minimumInputLength: 1,
    });

    $('.btnAddClient').on('click', function () {
        $('#myModalClient').modal('show');
    });

    $('#myModalClient').on('hidden.bs.modal', function (e) {
        $('#frmClient').trigger('reset');
    });

    $('input[name="birthdate"]').datetimepicker({
        useCurrent: false,
        format: 'YYYY-MM-DD',
        locale: 'es',
        keepOpen: false,
        maxDate: new Date()
    });

    $('#frmClient').on('submit', function (e) {
        e.preventDefault();
        var parameters = new FormData(this);
        parameters.append('action', 'create_client');
        submit_with_ajax(pathname, 'Notificación',
            '¿Estas seguro de crear al siguiente cliente?', parameters, function (response) {
                var newOption = new Option(response.full_name, response.id, false, true);
                select_client.append(newOption).trigger('change');
                $('#myModalClient').modal('hide');
            });
    });

    select_search_product.select2({
        theme: "bootstrap4",
        language: 'es',
        allowClear: true,
        ajax: {
            delay: 250,
            type: 'POST',
            url: pathname,
            headers: {
                'X-CSRFToken': csrftoken
            },
            data: function (params) {
                return {
                    term: params.term,
                    action: 'search_products_select2',
                    ids: JSON.stringify(sale.getProductsIds())
                };
            },
            processResults: function (data) {
                return {
                    results: data
                };
            },
        },
        placeholder: 'Ingrese una descripción',
        minimumInputLength: 1,
        templateResult: function (repo) {

            if (repo.loading) {
                return repo.text;
            }

            if (!Number.isInteger(repo.id)) {
                return repo.text;
            }

            return $(
                '<div class="wrapper container">' +
                '<div class="row">' +
                '<div class="col-lg-1">' +
                '<img alt="" src="' + repo.image + '" class="img-fluid img-thumbnail d-block mx-auto rounded">' +
                '</div>' +
                '<div class="col-lg-11 text-left shadow-sm">' +
                //'<br>' +
                '<p class="m-2">' +
                '<b>Nombre:</b> ' + repo.full_name + '<br>' +
                '</p>' +
                '</div>' +
                '</div>' +
                '</div>');
        },
    })
        .on('select2:select', function (e) {
            var data = e.params.data;
            if (!Number.isInteger(data.id)) {
                return false;
            }
            data.cant = 1;
            data.subtotal = 0.00;
            data.precio = 0.00;
            sale.addProduct(data);
            select_search_product.val('').trigger('change.select2');
        });

    $('#tblProducts tbody')
        .off()
        .on('click', 'a[rel="remove"]', function () {
            var tr = tblProducts.cell($(this).closest('td, li')).index();
            alert_action('Notificación', '¿Estas seguro de eliminar el producto de tu detalle?',
                function () {
                    sale.details.products.splice(tr.row, 1);
                    tblProducts.row(tr.row).remove().draw();
                    sale.calculateInvoice();
                }, function () {

                });
        })
        .on('change', 'input[name="cant"]', function () {
            console.clear();
            var cant = parseInt($(this).val());
            var tr = tblProducts.cell($(this).closest('td, li')).index();
            sale.details.products[tr.row].cant = cant;
            sale.calculateInvoice();
            $('td:last', tblProducts.row(tr.row).node()).html('$' + sale.details.products[tr.row].subtotal.toFixed(2));
        })
        .on('change', 'textarea[name="observaciones"]', function () {
            console.clear();
            var obs = $(this).val();
            sale.details.products[row_products].observaciones = obs;
        })
        .on('click', 'a[rel="atributo"]', function () {
            var tr = $(this).closest('tr');
            var row = tblProducts.row(tr);
            row_products = row[0];
            if (row.child.isShown()) {
                row.child.hide();
                tr.removeClass('shown');
            } else {
                row.child(sale.formatAtributoRowHtml(row.data())).show();
                tr.addClass('shown');
            }

        })
        .on('change', 'input[name="importe-atributo"]', function () {
            var costo = parseFloat($(this).val());
            var tr = $(this).closest('tr').index();
            sale.details.products[row_products]['atributos'][tr].precio = costo;
            sale.calculateInvoice();
            $('td:last', tblProducts.row(row_products).node()).html('$' + sale.details.products[row_products].subtotal.toFixed(2));

            $('td:eq(2)', tblProducts.row(row_products).node()).html('$' + sale.details.products[row_products].precio.toFixed(2));
        });

    $('.btnRemoveAll').on('click', function () {
        if (sale.details.products.length === 0) return false;
        alert_action('Notificación', '¿Estas seguro de eliminar todos los details de tu detalle?', function () {
            sale.details.products = [];
            sale.listProducts();
        }, function () {

        });
    });

    $('.btnClearSearch').on('click', function () {
        select_search_product.val('').focus();
    });

    $('.btnSearchProducts').on('click', function () {
        tblSearchProducts = $('#tblSearchProducts').DataTable({
            responsive: true,
            autoWidth: false,
            destroy: true,
            deferRender: true,
            ajax: {
                url: pathname,
                type: 'POST',
                data: {
                    'action': 'search_products',
                    'ids': JSON.stringify(sale.getProductsIds()),
                    'term': select_search_product.val()
                },
                dataSrc: "",
                headers: {
                    'X-CSRFToken': csrftoken
                },
            },
            columns: [
                {"data": "full_name"},
                {"data": "image"},
                {"data": "stock"},
                {"data": "pvp"},
                {"data": "id"},
            ],
            columnDefs: [
                {
                    targets: [-4],
                    class: 'text-center',
                    orderable: false,
                    render: function (data, type, row) {
                        return '<img src="' + data + '" class="img-fluid d-block mx-auto" style="width: 20px; height: 20px;">';
                    }
                },
                {
                    targets: [-3],
                    class: 'text-center',
                    render: function (data, type, row) {
                        if (!row.is_inventoried) {
                            return '<span class="badge badge-secondary">Sin stock</span>';
                        }
                        return '<span class="badge badge-secondary">' + data + '</span>';
                    }
                },
                {
                    targets: [-2],
                    class: 'text-center',
                    orderable: false,
                    render: function (data, type, row) {
                        return '$' + parseFloat(data).toFixed(2);
                    }
                },
                {
                    targets: [-1],
                    class: 'text-center',
                    orderable: false,
                    render: function (data, type, row) {
                        var buttons = '<a rel="add" class="btn btn-success btn-xs btn-flat"><i class="fas fa-plus"></i></a> ';
                        return buttons;
                    }
                },
            ],
            initComplete: function (settings, json) {

            }
        });
        $('#myModalSearchProducts').modal('show');
    });

    $('#tblSearchProducts tbody')
        .off()
        .on('click', 'a[rel="add"]', function () {
            var tr = tblSearchProducts.cell($(this).closest('td, li')).index();
            var product = tblSearchProducts.row(tr.row).data();
            product.cant = 1;
            product.subtotal = 0.00;
            sale.addProduct(product);
            tblSearchProducts.row($(this).parents('tr')).remove().draw();
        });

    // Form Sale

    $('#date_joined').datetimepicker({
        format: 'YYYY-MM-DD',
        useCurrent: false,
        locale: 'es',
        orientation: 'bottom',
        keepOpen: false
    });

    $("input[name='iva']").TouchSpin({
        min: 0,
        max: 100,
        step: 1,
        decimals: 2,
        boostat: 5,
        maxboostedstep: 10,
        postfix: '%'
    }).on('change', function () {
        sale.calculateInvoice();
    });

    $("input[name='ganancia']").TouchSpin({
        min: 0,
        max: 100,
        step: 1,
        decimals: 2,
        boostat: 5,
        maxboostedstep: 10,
        postfix: '%'
    }).on('change', function () {
        sale.calculateInvoice();
    });

    $('#frmSale').on('submit', function (e) {
        e.preventDefault();

        if (sale.details.products.length === 0) {
            message_error('Debe al menos tener un item en su detalle de venta');
            return false;
        }

        var success_url = this.getAttribute('data-url');
        var parameters = new FormData(this);
        parameters.append('products', JSON.stringify(sale.details.products));
        submit_with_ajax(pathname, 'Notificación',
            '¿Estas seguro de realizar la siguiente acción?', parameters, function (response) {
            location.href = success_url;
                // alert_action('Notificación', '¿Desea imprimir la boleta de venta?', function () {
                //     window.open('/pos/sale/invoice/pdf/' + response.id + '/', '_blank');
                //     location.href = success_url;
                // }, function () {
                //     location.href = success_url;
                // });
            });
    });
    sale.listProducts();
});

