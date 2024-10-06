// local storage
const storage = new LocalStorageManager();

function setBaudrate(value) {
    $('#dropdownBaudRate').text('baudrate: ' + value);
    // add the class .active to the selected baudrate
    $('#baudrateDropdown .dropdown-item').removeClass('active');
    $('#baudRate' + value).addClass('active');
  }

function setInfo(value) {
    // set info in local storage
    let projectName = getSelectedProject();
    if (projectName) {
        storage.setField('info', value, projectName);
    }
  }

function setData() {
    // set data points in local storage
    let projectName = getSelectedProject();
    if (projectName) {
        storage.setField('data', points, projectName);
    }
  }

function getBaudrate() {
    return parseInt($('#dropdownBaudRate').text().split(' ')[1]);
  }

// Toggle sidebar
$('#burgerButton').click(function () {
    const sidebar = $('#sidebar')[0];
    const scrollablePanel = $('#scrollablePanel')[0];

    sidebar.classList.toggle('show');

    // Adjust margin for the scrollable panel
    if (sidebar.classList.contains('show')) {
        scrollablePanel.style.marginLeft = '250px';
    } else {
        scrollablePanel.style.marginLeft = '0';
    }

    // Adjust plot size based on sidebar visibility
    if (sidebar.classList.contains('show')) {
        Plotly.relayout('plotId', {
            width: window.innerWidth - 250 - 20,
        });
    } else {
        Plotly.relayout('plotId', {
            width: window.innerWidth - 20,
        });
    }
});

// Close modal panel with button
$('#closeModalButton').on('click', function () {
    $('#modalPanel').hide();
    $('#modalOverlay').hide();
});

// Close modal panel by clicking outside
$('#modalOverlay').on('click', function () {
    $('#modalPanel').hide();
    $('#modalOverlay').hide();
});

function showAlert(title, message) {
    $('#modalPanel h4').text(title);
    $('#modalPanel p').text(message);
    $('#modalPanel').show();
    $('#modalOverlay').show();
    $('#modalPanel button').focus();
}

// Resizing logic for both desktop and mobile
let isResizing = false;

// Desktop: mouse events
$('#scrollablePanel').on('mousedown', function (e) {
    isResizing = true;
    $('body').css('user-select', 'none'); // Disable text selection during resizing
    $(document).mousemove(resizePanel);
    $(document).mouseup(stopResizing);
});

// Mobile: touch events
$('#scrollablePanel').on('touchstart', function (e) {
    isResizing = true;
    $('body').css('user-select', 'none'); // Disable text selection during resizing
    $(document).on('touchmove', resizePanelTouch);
    $(document).on('touchend', stopResizing);
});

function resizePanel(e) {
    if (!isResizing) return;

    // Calculate the new top position for the scrollable panel
    const newTop = e.clientY;

    // Make sure the new top doesn't go above the main content area
    if (newTop > 100 && newTop < (window.innerHeight - 40)) {
        const height = window.innerHeight - newTop;
        scrollablePanel.style.height = `${height}px`;
    }
}

function resizePanelTouch(e) {
    if (!isResizing) return;

    // Use touch event to get the Y coordinate
    const touch = e.touches[0];
    const newTop = touch.clientY;

    // Make sure the new top doesn't go above the main content area
    if (newTop > 100 && newTop < (window.innerHeight - 40)) {
        const height = window.innerHeight - newTop;
        scrollablePanel.style.height = `${height}px`;
    }
}

function stopResizing() {
    isResizing = false;
    document.body.style.userSelect = ''; // Re-enable text selection after resizing
    document.removeEventListener('mousemove', resizePanel);
    document.removeEventListener('mouseup', stopResizing);
    document.removeEventListener('touchmove', resizePanelTouch);
    document.removeEventListener('touchend', stopResizing);
}

document.addEventListener('DOMContentLoaded', function () {

    // initialize plot
    initPlot();

    // store info on each keystroke
    $('#projectInfo').on('input', function() {
        setInfo($(this).val());
    });

    // create the table
    var table = $('#sidebarTable').DataTable({
        columns: [
            {
                data: null,
                defaultContent: '<i class="fas fa-trash-alt delete-btn"></i>',
                orderable: false,
                width: '10%'
            },
            {
                data: 'name',
                render: function (data, type, row) {
                    if (type === 'display') {
                        return '<span class="editable">' + (data || '') + '</span>';
                    }
                    return data;
                }
            },
            {
                // Hidden column for ordering
                data: 'createdAt',
                visible: false
            },
        ],
        select: {
            style: 'single',
            selector: 'td:nth-child(2)'
        },
        order: [[2, 'desc']],  // Sort by the hidden 'createdAt' column
        language: {
            emptyTable: "No projects so far..."
        },
        paging: false,
        searching: false,
        info: false
    });

    // set the default baudrate
    setBaudrate(9600);

    // New row creation
    $('#addRowBtn').on('click', function () {
        switchOff();
        let createdAt = new Date().toISOString();
        // let newRow = table.row.add({name: '', createdAt: createdAt}).draw().node();
        let newRow = addRow('', createdAt);
        $(newRow).find('td:nth-child(2)').trigger('dblclick');
        $('#projectInfo').val('');
        points = [];
        printPoints();
        plotPoints();
    });

    function addRow(name, createdAt) {
        let newRow = table.row.add({name: name, createdAt: createdAt}).draw().node();
        // $(newRow).on('select', function () {
        //     console.log('new row selected: ');//, table.row(newRow).data()
        // });
        return newRow;
    }

    // Edit on double click
    $('#sidebarTable').on('dblclick', 'td:nth-child(2)', function () {
        // first, make sure to select the row
        table.row($(this).closest('tr')).select();

        let cell = table.cell(this);
        let currentText = $(this).text();
        $(this).html('<input type="text" class="form-control edit-input" value="' + currentText + '">');
        let input = $(this).find('input');
        input.focus();

        input.on('blur', function () {
            var newText = $(this).val();
            let existingProjects = table.data().toArray().map(d => d.name);
            // if newText is empty, delete the row
            if (newText === '') {
                table.row($(this).closest('tr')).remove().draw();
                storage.removeItem(currentText);
                ensureRowSelection();
            } else if (existingProjects.includes(newText) & currentText !== newText){
                // if the name already exists, show alert and delete the row
                $(this).trigger('dblclick');
                showAlert('Duplicate Names', 'A project with the same name already exists. Please use a different name.');
            } else {
                cell.data(newText).draw();
                // log the content of the row
                let rowIndex = table.row({ selected: true }).index();
                let createdAt = table.row(rowIndex).data().createdAt;
                // update the local storage
                if (currentText === '') {
                    // we come from just creating a project
                    storage.setItem(
                        newText,
                        {createdAt:createdAt, data:[], info: ''}
                    );
                } else if (currentText !== newText) {
                    // the project already exists, so we just rename it
                    storage.renameKey(currentText, newText);
                }
            }
            table.row($(this).closest('tr')).select();
        });

        input.on('keypress', function (e) {
            if (e.which === 13) {
                $(this).blur();
            }
        });

    });

    // event to avoid deselection
    $('#sidebarTable').on('click', '.editable', function () {
        let row = table.row($(this).closest('tr'));
        row.select();
    });

    // event handler when a cell gets selected either by the user or programmatically
    table.on('select', function () {
        let projectName = getSelectedProject();
        if (projectName !== ''){
            // switch off reading
            switchOff();
            // load info into text area
            let project = storage.getItem(projectName);
            $('#projectInfo').val(project.info);
            // load points from storage
            points = project.data;
            // display data in the terminal
            printPoints();
            // display data in plot
            plotPoints();
        }
    });

    // Delete row
    $('#sidebarTable').on('click', '.delete-btn', function (e, dt, type, cell) {
        let row = table.row($(this).closest('tr'));
        let storageKey = row.data().name;
        row.remove().draw();
        // delete the corresponding local storage item
        storage.removeItem(storageKey);
        ensureRowSelection();
    });

    // Ensure a row is always selected if there are rows
    function ensureRowSelection() {
        if (table.rows().count() > 0 && table.rows({ selected: true }).count() === 0) {
            table.row(0).select();
        } else if (table.rows().count() === 0) {
            points = [];
            printPoints();
            plotPoints();
        }
    }

    // Call after any change to the table
    // table.on('draw', ensureRowSelection);

    // Populate table with data from local storage
    populateTableFromLocalStorage();

    // Prevent deselection
    // table.on('user-select', function (e, dt, type, cell, originalEvent) {
    //     if (table.rows({ selected: true }).count() === 0) {
    //         e.preventDefault();
    //     }
    // });

    // Add this new function to populate the table from local storage
    function populateTableFromLocalStorage() {
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            const value = storage.getItem(key);

            // Add a new row to the table and use the createdAt as the order
            addRow(key, value.createdAt)
        }
    }

    // In the beginning, at least one project is selected unless there is none
    ensureRowSelection();

});


function getSelectedProject(){
    try {
        return $('#sidebarTable').DataTable().row({selected:true}).data().name;
    } catch (error) {
        // if there are no rows at all
        return null;
    }
}

function switchOff() {
    $('#switch').prop('checked', false);
}

$('#intervalInput').on('change', setIntervalValue);