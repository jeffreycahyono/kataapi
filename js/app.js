var apiUrl= "/kataapi/api/kamus";

var listData = [];
var tplItem = _.template($('#tpl-item').html());
var tplTable = _.template($('#tpl-table').html());
var tplViewItem = _.template($('#tpl-viewitem').html());
var $modal = $('#myModal');

var loadList = function(){
    return  $.ajax(apiUrl, {
      dataType : "json"
    });
};

var viewList = function(list){
    var html = "";
    _.each(list, function(item){
        if(!_.isEmpty(item) && !_.isEmpty(item.kata) && !_.isEmpty(item.arti)){
            html = html + tplItem(item);
        }
    });

    html = tplTable({content: html});
    $('#mainbox').html(html);
};


var viewEdit = function(kata,arti){
    var isCreate= _.isEmpty(kata);
    var judul = (isCreate ? 'Tambah' : 'Edit');

    $modal.find('#modal-label').html ( judul + 'Kata');

    if(kata) $modal.find('[name="kata"]').val(kata);
    if(arti) $modal.find('[name="arti"]').val(arti);

    $('#btnsave').data('createMode', isCreate);
    $modal.modal('show');
};

$('#btnsave').click(function(){
    var data = {
        kata : $modal.find('[name="kata"]').val(),
        arti : $modal.find('[name="arti"]').val()
    };

    var option = {
        processData : false,
        data: JSON.stringify(data)
    };
    var judul='', url = apiUrl;
    if( $(this).data('createMode')  ){
        option.type = 'POST'; judul = 'Tambah';
    }
    else{
        option.type = 'PUT'; judul = 'Edit';
        url = url + '/' + encodeURIComponent(data.kata);
    }

    $.ajax( url , option )
        .done(function(data){
            alert('Berhasil '+judul+ ' kata ' + data.kata+', dg arti '+ data.arti);
            redrawListKata();
        })
        .fail(function(xhr, errorText ){
            alert('ERROR : ' + xhr.responseText);
        });



    $modal.modal('hide');
});




var viewHapus = function(kata){
    if(confirm('Habpus '+kata+'?')){
    var url = apiUrl + '/' + encodeURIComponent(kata);
    var option = {
        type : 'DELETE'
    };
    $.ajax( url , option )
        .done(function(data){
            alert('Berhasil hapus '+kata);
            redrawListKata();
        })
        .fail(function(xhr, errorText ){
            alert('ERROR : ' + xhr.responseText);
        });

    }
};

var viewItem = function(kata){
    kata = encodeURIComponent(kata);
    $.getJSON(apiUrl+'/'+kata).done(function(data){
        var html = tplViewItem(data);
        $('#mainbox').html(html);
    });
};


var redrawListKata = function(){
    loadList().done(function(data){
        listData = data;
        viewList(listData);
        console.log(data);
    });
};


$(".menu-item").on("click",function(e){
    e.preventDefault();
    $(".menu-item").removeClass('active');
    $(this).addClass('active');
});

$("body").on("click", "[data-action]" , function(e){
    e.preventDefault();
    var data = $(this).data(),
        action = data.action,
        kata = data.kata || '';

    switch(action){
        case 'list' :
            redrawListKata();
            break;
        case 'tambah':
            viewEdit(null);
            break;
        case 'edit':
            var item = _.find(listData,function(item){
                return item && item.kata && item.arti && item.kata == kata;
            });
            viewEdit(kata, item.arti);
            break;
        case 'lihat' :
            viewItem(kata);
            break;
        case 'hapus' :
            viewHapus(kata);
    }

});


$(function(){
    redrawListKata();
});