///////////////////////////////////////////////////////////////////////////////
async function exportProject(projectName){
    let project = storage.getItem(projectName);

    let contents = '';
    contents += `# createdAt: ${project.createdAt}\n`;
    contents += `# ${project.info.replace('\n', '\n# ')}\n`;
    // column names
    let columns = _.uniq(_.flatten(_.map(project.data, _.keys)));
    contents += `${columns.join('\t')}\n`;
    // data itself
    project.data.forEach(function(d) {
        columns.forEach(column => {
            let terminator = (column === columns.slice(-1)[0]) ? '\n' : '\t';
            if (d[column] != undefined) {
                contents += d[column] + terminator;
            } else {
                contents += terminator;
            }
        });
    });

    const blob = new Blob([contents], { type: 'text/csv;charset=utf-8;' });

    // create a new handle
    const newHandle = await window.showSaveFilePicker({
        suggestedName: projectName + '.tsv',
    });

    // create a FileSystemWritableFileStream to write to
    const writableStream = await newHandle.createWritable();

    // write our file
    await writableStream.write(blob);

    // close the file and write the contents to disk.
    await writableStream.close();

}
