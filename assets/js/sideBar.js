let sideBar = function(){
    let list = document.querySelectorAll('.listItem');
    let navLink = document.querySelectorAll('.navLink');

    for (let i = 0; i < list.length; i++) {
        list[i].onclick = function (event) {
            event.preventDefault();
            let j = 0;
            let k = 0;
            while (j < list.length) {
                let textNotActive = list[j].getElementsByTagName("span")[0];
                if (list[j].clientWidth < textNotActive.clientWidth) {
                    textNotActive.classList.remove("animate");
                }
                list[j++].className = 'listItem';
            }
            
            let text = list[i].getElementsByTagName("span")[0];
            list[i].className = 'listItem active';
            if (list[i].clientWidth < text.clientWidth) {
                text.classList.add("animate");
            }

            if(list[i].id == 'homeItem'){
                $('#homeSection').attr("class","dynamicSection active");
                $('#dataSection').attr("class","dynamicSection");
            } 
            else{
                let fileDataDiv = $('#fileDataDiv');
                $('#spinnerDiv').addClass('active');
                $.ajax({
                    type: 'get',
                    url: $(navLink[i]).attr('href'),
                    success: function(data) {
                        $('#homeSection').attr("class","dynamicSection");
                        $('#dataSection').attr("class","dynamicSection active");
                        fileDataDiv.empty();
                        fileDataDiv.append(newFileDom(data.data.file));
                        $('#spinnerDiv').removeClass('active');
                        searchData();
                        sortData();
                    },
                    error: function(error) {
                        console.log(error.responseText);
                    }
                });
            }
        }
    }
}

$(".listItem").each(function () {
    let $item = $(this);
    let text = $item.find("span").first();

    $item.hover(
        function () {
            if ($item.width() < text.width()) {
                text.addClass("animate");
            }
        },
        function () {
            if (!$item.hasClass("active") && $item.width() < text.width()) {
                text.removeClass("animate");
            }
        }
    );
});


sideBar();