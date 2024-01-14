var atributos = {
    list: function () {
        $('#data').DataTable({
            responsive: true,
            autoWidth: false,
            destroy: true,
            deferRender: true,
            order: [0, 'asc'] [1, 'asc'],
            ajax: {
                url: pathname,
                type: 'POST',
                data: {
                    'action': 'search'
                },
                dataSrc: "",
                headers: {
                    'X-CSRFToken': csrftoken
                }
            },
            columns: [
                // {"data": "id"},
                {"data": "producto"},
                {"data": "atributo"},
                {"data": "costo"},
                {"data": "id"},
            ],
            columnDefs: [
                {
                    targets: [-1],
                    class: 'text-center',
                    orderable: false,
                    render: function (data, type, row) {
                        var buttons = '<a href="' + pathname + 'update/' + row.id + '/" class="btn btn-warning btn-xs btn-flat"><i class="fas fa-edit"></i></a> ';
                        buttons += '<a href="' + pathname + 'delete/' + row.id + '/" type="button" class="btn btn-danger btn-xs btn-flat"><i class="fas fa-trash-alt"></i></a>';
                        return buttons;
                    }
                },
            ],
            initComplete: function (settings, json) {

            }
        });
    }
};

$(function () {
    atributos.list();

    $('.select2').select2({
        theme: "bootstrap4",
        language: 'es'
    });
});