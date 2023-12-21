const drop = document.querySelector(".drop-area");
const instructionsUpper = document.querySelector(".instructionsUpper");
const instructionsLower = document.querySelector(".instructionsLower");
const dragOver = document.querySelector(".dragOver");

drop.addEventListener("dragover", (e)=> {
    e.preventDefault();
    drop.classList.add("active");
    instructionsUpper.classList.add("active");
    instructionsLower.classList.add("active");
    dragOver.classList.add("active");
});

drop.addEventListener("dragleave", (e)=> {
    e.preventDefault();
    drop.classList.remove("active");
    instructionsUpper.classList.remove("active");
    instructionsLower.classList.remove("active");
    dragOver.classList.remove("active");
});

drop.addEventListener("drop", (e)=> {
    e.preventDefault();
    let files= [];
    let fileInput = document.getElementById("csvPath");
    drop.classList.remove("active");
    instructionsUpper.classList.remove("active");
    instructionsLower.classList.remove("active");
    dragOver.classList.remove("active");
    files = e.dataTransfer.files;
    fileInput.files = files;
    displayFileName(fileInput);
});

function displayFileName(input) {
    let fileDisplay = document.getElementById('file-name-display');
    let fileName = input.files[0].name;
    fileDisplay.innerHTML = `<span id="fileNameDiv">Selected File</span>&nbsp;: ${fileName}&nbsp;<div id="deleteBtnDiv" onclick="deleteFile();"><ion-icon id="deleteBtn" name="trash-outline"></ion-icon></div>`;
}

function deleteFile() {
    let fileDisplay = document.getElementById('file-name-display');
    $("#csvPath").val('');
    fileDisplay.innerHTML = ``;
}

let newCsvForm = $('#csvForm');

newCsvForm.submit(function (event) {
    event.preventDefault();
    $('#spinnerDiv').addClass('active');
    let fileInput = document.getElementById('csvPath');

    if (!fileInput.files || fileInput.files.length === 0) {
        alert('Please select a file before submitting the form');
        $('#spinnerDiv').removeClass('active');
        return;
    }

    validateFile(fileInput);

    let form = new FormData((newCsvForm)[0]);

    $.ajax({
        type: 'post',
        url: '/uploadFile',
        data: form,
        contentType: false,
        processData: false,
        success: function (data) {
            $('#filesTable tbody').prepend(newRow(data.data.file));
            $('#fileItemsDiv').prepend(newListItem(data.data.file));
            $('#filesTable tbody tr').each(function (index) {
                $(this).find('td:first').text(index + 1);
            });
            $('#spinnerDiv').removeClass('active');
            destroyFile();
            sideBar();
            viewFile();
        },
        error: function (error) {
            console.log(error.responseText);
        }
    });
    deleteFile();
});

function validateFile(input) {
    let allowedFileTypes = ["text/csv","csv", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/vnd.ms-excel"];
    let fileName = input.files[0].name;
    let fileType = input.files[0].type;

    if (!allowedFileTypes.includes(fileType.toLowerCase()) && !allowedFileTypes.includes(fileType.toUpperCase())) {
        alert('Invalid file type. Please select a valid file type.');
        input.value = "";
        $('#spinnerDiv').removeClass('active');
        return;
    }

    if (fileName.length > 50) {
        alert('Please use a shorter file name, it exceeds the allowed limit.');
        input.value = "";
        $('#spinnerDiv').removeClass('active');
        return;
    }

    let fileSize = input.files[0].size;
    let maxSize = 1024 * 1024;

    if (fileSize > maxSize) {
        alert('File size exceeds the maximum allowed size (1 MB)');
        input.value = "";
        $('#spinnerDiv').removeClass('active');
        return;
    }
}

let newRow = function (file) {
    return `<tr class="trow" id="row-${file._id}">
    <td>
        1
    </td>
    <td>
        ${file.originalname}
    </td>
    <td>
        ${((file.size) / 1000).toFixed(2)} KB
    </td>
    <td>
            <div>
                ${new Date(file.createdAt).toLocaleDateString('en-GB')}
            </div>
            <div>
                ${new Date(file.createdAt).toLocaleTimeString('en-US', { hour12: true, hour: 'numeric', minute: '2-digit' }).toLowerCase()}
            </div>
    </td>
    <td>
        <a href="/viewFile?id=${file._id}" class="previewBtn">
            <i class="fa-regular fa-file-lines"></i>&ensp;Preview File</a>&nbsp;|&nbsp;
        <a href="/deleteFile?id=${file._id}" class="deleteFileBtn">
            <ion-icon name="trash-outline"></ion-icon>
        </a>
    </td>
</tr>`;
}

let newListItem = function (file) {
    return `<div class="listItem" id="list-${file._id}">
                <span>
                    <a class="navLink" href="/viewFile?id=${file._id}">
                        <p class="title">
                            ${file.originalname}
                        </p>
                    </a>
                </span>
            </div>`;
}

let destroyFile = function () {
    $('.deleteFileBtn').on("click", function (event) {
        event.preventDefault();
        $('#spinnerDiv').addClass('active');
        $.ajax({
            type: 'get',
            url: $(this).attr('href'),
            success: function (data) {
                if (data.data.deleted) {
                    $(`#row-${data.data.fileId}`).remove();
                    $(`#list-${data.data.fileId}`).remove();
                }
                $('#filesTable tbody tr').each(function (index) {
                    $(this).find('td:first').text(index + 1);
                });
                $('#spinnerDiv').removeClass('active');
                sideBar();
                viewFile();
            },
            error: function (error) {
                console.log(error.responseText);
            }
        });
    });
}

let viewFile = function () {
    $('.previewBtn').on("click", function (event) {
        event.preventDefault();
        let fileDataDiv = $('#fileDataDiv');
        $('#spinnerDiv').addClass('active');
        $.ajax({
            type: 'get',
            url: $(this).attr('href'),
            success: function (data) {
                $('#homeSection').attr("class", "dynamicSection");
                $('#dataSection').attr("class", "dynamicSection active");
                fileDataDiv.empty();
                fileDataDiv.append(newFileDom(data.data.file));
                $('#spinnerDiv').removeClass('active');
                searchData();
                sortData();
            },
            error: function (error) {
                console.log(error.responseText);
            }
        });
    });
}

let newFileDom = function (file) {
    return `
    <div class="tableHeadDiv">
        <h3>${file.originalname}</h3>
            <div class="input-container">
                <input type="text" name="dataSearchInput" id="dataSearchInput" class="searchInput" autocomplete="off" placeholder="search...">
                <span class="searchIcon"> 
                  <svg width="19px" height="19px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path opacity="1" d="M14 5H20" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> <path opacity="1" d="M14 8H17" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M21 11.5C21 16.75 16.75 21 11.5 21C6.25 21 2 16.75 2 11.5C2 6.25 6.25 2 11.5 2" stroke="#000" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path> <path opacity="1" d="M22 22L20 20" stroke="#000" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
                </span>
            </div>
        </div>
    <div id="fileDataContainer">
        <table id="fileDataTable">
            <thead>
                <tr class="trow">
                    <th>#</th>
                    ${file.file[0].map((th) => (
        `<th><div class="thCol">${th != null ? th : '_'}<ion-icon class="filterCol" name="chevron-expand-outline"></ion-icon></div></th>`
    )).join("")}
                </tr>
            </thead>
            <tbody>
                ${file.file.slice(1).map((tr, i) => (
        `<tr class="trow">
                        <td>${i + 1}</td>
                        ${tr.map((td) => (
            `<td>${td != null ? td : '-'}</td>`
        )).join("")}
                    </tr>`
    )).join("")}
            </tbody>
        </table>
    </div>
    `;
}

$("#fileSearchInput").on("input", function () {
    let filter = $(this).val().toUpperCase();
    $("#filesTable tr:gt(0)").each(function () {
        let row = $(this);
        let hasMatch = false;
        row.find("td").each(function () {
            let cellText = $(this).text().toUpperCase();
            if (cellText.indexOf(filter) > -1) {
                hasMatch = true;
                return false;
            }
        });
        row.toggle(hasMatch);
    });
});

let searchData = function () {
    $("#dataSearchInput").on("input", function () {
        let filter = $(this).val().toUpperCase();
        $("#fileDataTable tr:gt(0)").each(function () {
            let row = $(this);
            let hasMatch = false;
            row.find("td").each(function () {
                let cellText = $(this).text().toUpperCase();
                if (cellText.indexOf(filter) > -1) {
                    hasMatch = true;
                    return false;
                }
            });
            row.toggle(hasMatch);
        });
    });
}

function sortTable(table, columnIndex) {
    let rows = table.find('tbody tr').get();
    let sortOrder = $(table.find('thead th').eq(columnIndex)).hasClass('sorted-asc') ? -1 : 1;

    rows.sort(function (a, b) {
        let A = extractCellValue($(a).children('td').eq(columnIndex));
        let B = extractCellValue($(b).children('td').eq(columnIndex));

        return sortOrder * compareValues(A, B);
    });

    $.each(rows, function (index, row) {
        table.children('tbody').append(row);
    });

    table.find('thead th').removeClass('sorted-asc sorted-desc');
    if (sortOrder === 1) {
        $(table.find('thead th').eq(columnIndex)).addClass('sorted-asc');
    } else {
        $(table.find('thead th').eq(columnIndex)).addClass('sorted-desc');
    }
}

function extractCellValue(cell) {
    let text = cell.text().trim();
    if (/^\d+(\.\d+)?\s*(KB|MB|GB)$/i.test(text)) {
        return parseFileSize(text);
    }
    return text;
}

function parseFileSize(value) {
    let match = value.match(/^(\d+(\.\d+)?)\s*(KB|MB|GB)$/i);
    if (match) {
        let size = parseFloat(match[1]);
        let unit = match[3].toUpperCase();

        if (unit === 'MB') {
            size *= 1024;
        } else if (unit === 'GB') {
            size *= 1024 * 1024;
        }

        return size;
    }

    return NaN;
}

function compareValues(a, b) {
    if (isNaN(a) || isNaN(b)) {
        return String(a).localeCompare(String(b));
    }
    return a - b;
}

let sortData = function () {
    $('th').click(function () {
        debugger;
        let table = $(this).closest('table');
        let columnIndex = $(this).index();

        sortTable(table, columnIndex);
    });
}

sortData();
destroyFile();
viewFile();
