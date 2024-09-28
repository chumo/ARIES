// local storage
const storage = new LocalStorageManager();

function setBaudrate(value) {
    $('#dropdownMenuButton').text('baudrate: ' + value);
    // add the class .active to the selected baudrate
    $('#baudrateDropdown .dropdown-item').removeClass('active');
    $('#baudRate' + value).addClass('active');
    // set baudrate in local storage
    let projectName = getSelectedProject();
    if (projectName) {
        storage.setField('baudrate', value, projectName);
    }
  }

function getBaudrate() {
    return parseInt($('#dropdownMenuButton').text().split(' ')[1]);
  }

// Toggle sidebar
document.getElementById('burgerButton').addEventListener('click', function () {
    const sidebar = document.getElementById('sidebar');
    const scrollablePanel = document.getElementById('scrollablePanel');

    sidebar.classList.toggle('show');

    // Adjust margin for the scrollable panel
    if (sidebar.classList.contains('show')) {
        scrollablePanel.style.marginLeft = '250px';
    } else {
        scrollablePanel.style.marginLeft = '0';
    }
});

// Close modal panel with button
document.getElementById('closeModalButton').addEventListener('click', function () {
    document.getElementById('modalPanel').style.display = 'none';
    document.getElementById('modalOverlay').style.display = 'none';
});

// Close modal panel by clicking outside
document.getElementById('modalOverlay').addEventListener('click', function () {
    document.getElementById('modalPanel').style.display = 'none';
    document.getElementById('modalOverlay').style.display = 'none';
});

// Resizing logic for both desktop and mobile
const scrollablePanel = document.getElementById('scrollablePanel');
let isResizing = false;

// Desktop: mouse events
scrollablePanel.addEventListener('mousedown', function (e) {
    isResizing = true;
    document.body.style.userSelect = 'none'; // Disable text selection during resizing
    document.addEventListener('mousemove', resizePanel);
    document.addEventListener('mouseup', stopResizing);
});

// Mobile: touch events
scrollablePanel.addEventListener('touchstart', function (e) {
    isResizing = true;
    document.body.style.userSelect = 'none'; // Disable text selection during resizing
    document.addEventListener('touchmove', resizePanelTouch);
    document.addEventListener('touchend', stopResizing);
});

function resizePanel(e) {
    if (!isResizing) return;

    // Calculate the new top position for the scrollable panel
    const newTop = e.clientY;

    // Make sure the new top doesn't go above the main content area
    if (newTop > 100 && newTop < (window.innerHeight - 50)) {
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
    if (newTop > 100 && newTop < (window.innerHeight - 50)) {
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
        let createdAt = new Date().toISOString();
        // let newRow = table.row.add({name: '', createdAt: createdAt}).draw().node();
        let newRow = addRow('', createdAt);
        $(newRow).find('td:nth-child(2)').trigger('dblclick');
    });

    function addRow(name, createdAt) {
        let newRow = table.row.add({name: name, createdAt: createdAt}).draw().node();
        console.log('new row created');
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
            } else if (existingProjects.includes(newText)){
                // if the name already exists, show alert and delete the row
                alert('A project with the same name already exists.');
                $(this).trigger('dblclick');
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
                        {createdAt:createdAt, data:[], baudrate: getBaudrate()}
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

    // event to handler project selection
    $('#sidebarTable').on('click', '.editable', function () {
        let row = table.row($(this).closest('tr'));
        let projectName = row.data().name;
        if (projectName === getSelectedProject()) {return;}

        row.select();
    });

    // event handler when a cell gets selected either by the user or programmatically
    table.on('select', function () {
        let projectName = getSelectedProject();
        if (projectName !== ''){
            // set corresponding baudrate
            let baudrate = storage.getItem(projectName).baudrate;
            setBaudrate(baudrate);
        }
    });

    // Delete row
    $('#sidebarTable').on('click', '.delete-btn', function (e, dt, type, cell) {
        let row = table.row($(this).closest('tr'));
        let storageKey = row.data().name;
        // let wasSelected = row.node().classList.contains('selected');
        row.remove().draw();
        // if (wasSelected && table.rows().count() > 0) {
        //     table.row(0).select();
        // }
        // delete the corresponding local storage item
        storage.removeItem(storageKey);
    });

    // do nothing if a deselection is triggered
    table.on('deselect', function (e, dt, type, cell) {
        e.preventDefault();
    });

    // Ensure a row is always selected if there are rows
    function ensureRowSelection() {
        if (table.rows().count() > 0 && table.rows({ selected: true }).count() === 0) {
            table.row(0).select();
        }
    }

    // Call after any change to the table
    table.on('draw', ensureRowSelection);

    // Initial selection
    ensureRowSelection();

    // Populate table with data from local storage
    populateTableFromLocalStorage();

    // Prevent deselection
    table.on('user-select', function (e, dt, type, cell, originalEvent) {
        if (table.rows({ selected: true }).count() === 0) {
            e.preventDefault();
        }
    });

    // Add this new function to populate the table from local storage
    function populateTableFromLocalStorage() {
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            const value = JSON.parse(localStorage.getItem(key));

            // Add a new row to the table and use the createdAt as the order
            addRow(key, value.createdAt)
        }
    }

});


function getSelectedProject(){
    try {
        return $('#sidebarTable').DataTable().row({selected:true}).data().name;
    } catch (error) {
        // if there are no rows at all
        return null;
    }
}
