// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: red; icon-glyph: file-alt;
/*
Listmania framework
Customizable list manager for iphoneOS and iPadOS.
(and you think you are free of Javascrip framework here...)
Version: 0.1
Author: @furlan
Changelog at the end of the file.
*/

const appName = Script.name()
const appInfo = getAppInfo(appName)
const model = importModule("LM" + appName + ".model")

let table = new UITable()

updateTable(appInfo.app.rootPage, appInfo.app.startUpMode).then(() => {table.reload()}) 

await table.present(true)

Script.complete()

async function updateTable(path, mode) {
  table.removeAllRows()
  const pageName = parsePath(path, "pageName")
  const id = parsePath(path, "id")
  let index = 0
  let row
  
  const rowsData = await model.getRowsData(pageName, id)
  
  if (isPageEditable(pageName)) {
//     let row = new UITableRow()
//     row.isHeader = true
//     row.addText("Actions", "Actions on content.")
    
//     if (mode === 'read') {
//       let oCell = row.addButton("Edit 📝")
//       let i = index
//       oCell.onTap = async () => {
//         table.removeAllRows() 
//         updateTable(pageName, 'edit').then(() => {table.reload()})
//       }
//     }
//     if (mode === 'edit') {
//       let oCell = row.addButton("Read ⏹")
//       let i = index
//       oCell.onTap = async () => {
//         table.removeAllRows() 
//         updateTable(pageName, 'read').then(() => {table.reload()})
//       }
//     }
    if (hasToShow("page-header", mode)) {
      row = new UITableRow()  
      row.isHeader = true
      row.addText(appName, "Books > Authors")
      index = addRowAction(row, index)
    }
    
    if (hasToShow("unhide-actions-button", mode)) {
      row = new UITableRow()  
      row.isHeader = true
      oCell = row.addButton("ACTIONS 🔽")
      oCell.onTap = async () => {
        updateTable(pageName, 'show-actions').then(() => {table.reload()})
      }
      index = addRowAction(row, index) // action button
    }
      
    if (hasToShow("hide-actions-button", mode)) {
      row = new UITableRow()  
      row.isHeader = true
//       row.backgroundColor = '#000000'
      oCell = row.addButton("HIDE ACTIONS 🔼")
      oCell.onTap = async () => {
        updateTable(pageName, 'read-only').then(() => {table.reload()})
      }
      index = addRowAction(row, index)
    }
    

    if (hasToShow("add-row-button", mode)) {  
      row = new UITableRow()  
      row.isHeader = true
      oCell = row.addButton("Add row 🆕")
      oCell.onTap = async () => {
        let newRowData = {}
        for (let cell of appInfo.pages[pageName].cells) {
          newRowData[cell.rowTitle] = "Enter new value"
        }
        addRow(pageName, newRowData)
      }
      index = addRowAction(row, index)
    }
    
    if (hasToShow("edit-rows-button", mode)) {  
      row = new UITableRow()  
      row.isHeader = true
      oCell = row.addButton("Edit rows 📝")
      oCell.onTap = async () => {
        updateTable(pageName, 'edit-rows').then(() => {table.reload()})
      }
      index = addRowAction(row, index)
    }
    
    if (hasToShow("delete-rows-button", mode)) {  
      row = new UITableRow()  
      row.isHeader = true
      oCell = row.addButton("Delete rows ❌")
      oCell.onTap = async () => {
        updateTable(pageName, 'delete-rows').then(() => {table.reload()})
      }
      index = addRowAction(row, index)
    }
    

  }
  
  
  // headers
  if (hasHeader(pageName)) {
    row = new UITableRow()
    row.isHeader = true
    if (hasToShow("edit-row-header", mode)) {
      row.addText("Edit", "Edit row fields")
    }
    
    if (hasToShow("delete-row-header", mode)) {
      row.addText("Delete", "Delete row")
    }
    
    for (let cell of appInfo.pages[pageName].cells) {
      row.addText(cell.headerTitle, cell.headerSubtitle)
    }
//     if (isPageEditable(pageName)) {
//       row.addText("Actions", "Edit row fields")
//     }
//     table.addRow(row)  
    index = addRowAction(row, index)
  }
  
  // contents

  for (let rowData of rowsData) {
    row = new UITableRow()
    row.dismissOnSelect = false
    let oCell
    
    if (hasToShow("delete-row-button", mode)) {
      oCell = row.addButton("❌")
      let i = index
      oCell.onTap = async () => {
          await editRow(pageName, i)
            .then(() => updateTable(pageName))
            .then(() => table.reload())
      }
    }
        
//       {
//       oCell = row.addButton("📝")
//       let i = index
//         oCell.onTap = async () => {
//           await editRow(pageName, i)
//             .then(() => updateTable(pageName, mode))
//             .then(() => table.reload())
//         }
//     }
    
    for (let cell of appInfo.pages[pageName].cells) {  
        let i = index
        if (hasToShow("content-edit-cells", mode)) {  
          oCell = row.addButton(rowData[cell.rowTitle].toString())
          oCell.onTap = () => {  
            editCell(pageName, cell.rowTitle, i)
              .then(() => updateTable(pageName, mode))
              .then(() => table.reload())
          }
      } else {
        // to-do: subtitle
        row.addText(rowData[cell.rowTitle].toString())
        row.onSelect = async (number) => {
          await showRow(pageName, i)
        }
    }
      
      
  
    }
    row.cellSpacing = 10
    index = addRowData(row, index)
//     table.addRow(row)
//     index++
  }
  
  if (appInfo.pages[pageName].onBack !== undefined) {
    let row = new UITableRow()
    let oCell = row.addButton("⏪ Back")
    oCell.onTap = async () => {
      await table.removeAllRows()
      updateTable(appInfo.pages[pageName].onBack, mode).then(() => table.reload())
    }
//     table.addRow(row)
    index = addRowAction(row, index)
  }
}

function addRowData(row, index) {
  table.addRow(row)
  const i = index + 1
  return i
}

function addRowAction(row, index) {
  table.addRow(row)
  return index
}

async function showRow(pageName, id) {  
  let rowData = await model.getRowData(pageName, id)
    
  let showRowTable = new UITable()
  
  let row
//   row.addButton("Back")
//   showRowTable.addRow(row)  
  for (let cell of appInfo.pages[pageName].cells) {
    row = new UITableRow()
    row.addText(cell.headerTitle + ":")
    row.addText(rowData[cell.rowTitle])
    showRowTable.addRow(row)
  }
  
  showRowTable.present()
   
}

async function addRow(pageName, newRowData) {  
  let addNewRowTable = new UITable()
  
  await updateAddNewRowTable(addNewRowTable, pageName, newRowData)
  
  addNewRowTable.present()
   
}

async function updateAddNewRowTable(addNewRowTable, pageName, newRowData) { 
  addNewRowTable.removeAllRows()
  let rowData = newRowData
  
  let row, oCell
//   row.addButton("Back")
//   showRowTable.addRow(row)  
  for (let cell of appInfo.pages[pageName].cells) {
    row = new UITableRow()
    row.addText(cell.headerTitle + ":")
    oCell = row.addButton(rowData[cell.rowTitle])
//     let headerTitle = cell.headerTitle
    oCell.onTap = () => {
      console.log("onTap cell")
      editNewCell(pageName, cell.headerTitle, rowData[cell.rowTitle])
        .then((newValue) => {
          console.log("new value: " + newValue)
          rowData[cell.rowTitle] = newValue
          updateAddNewRowTable(addNewRowTable, pageName, rowData)
        }).then(() => addNewRowTable.reload())
    }
    addNewRowTable.addRow(row)
  }
}

async function editNewCell(pageName, rowTitle, value) {
  console.log("editNewCell")
  let edit = new Alert()
  
  edit.title = "Value for " + pageName
  edit.message = "Enter new values"
  edit.addTextField(value)
  
  edit.addAction("OK")
  edit.addCancelAction("Cancel")
  let action = await edit.present()
  console.log("action: " + action)
  console.log("field value: " + edit.textFieldValue(0))
  if (action !== -1) { return edit.textFieldValue(0) }
  if (action === -1) { return value }
  
}

async function editCell(pageName, rowTitle, id) {
  console.log("::editRow (id): " + id + "/" + pageName)
  let rowData = await model.getRowData(pageName, id)
  let edit = new Alert()

  for (let cell of appInfo.pages[pageName].cells) {
    if (cell.rowTitle === rowTitle) {
      edit.title = "Edit: " + pageName + ">" + cell.headerTitle
      edit.message = "Enter new values"
      edit.addTextField(cell.headerTitle, rowData[cell.rowTitle])
    }
  }
  
  edit.addAction("Save")
  edit.addDestructiveAction("Delete Row")
  edit.addCancelAction("Cancel")
  let action = await edit.present()
  
  if (action === 0) {
    for (let cell of appInfo.pages[pageName].cells) {
      if (cell.rowTitle === rowTitle) {  
        rowData[cell.rowTitle] = edit.textFieldValue(0)
      }
    }
  }
  return await model.setRowData(pageName, id, rowData) 
}

async function editRow(pageName, id) {
  console.log("::editRow (id): " + id + "/" + pageName)
  let rowData = await model.getRowData(pageName, id)
  let edit = new Alert()
  
  edit.title = "Edit row for " + pageName
  edit.message = "Enter new values"
  
  for (let cell of appInfo.pages[pageName].cells) {
    edit.addTextField(cell.headerTitle, rowData[cell.rowTitle])
  }
  
  edit.addAction("Save")
  edit.addDestructiveAction("Delete Row")
  edit.addCancelAction("Cancel")
  let action = await edit.present()
  
  if (action === 0) {
    let i = 0
    for (let cell of appInfo.pages[pageName].cells) {
      rowData[cell.rowTitle] = edit.textFieldValue(i)
      i++
    }
  }
  return await model.setRowData(pageName, id, rowData)
}

function hasToShow(element, mode) {
  let modes = []
  modes.push({"element": "page-header", "show": ["read-only", "show-actions", "edit-rows"]})
  modes.push({"element": "unhide-actions-button", "show": ["read-only"]})
  modes.push({"element": "hide-actions-button", "show": ["show-actions", "edit-rows"]})
  modes.push({"element": "add-row-button", "show": ["show-actions", "edit-rows"]})
  modes.push({"element": "edit-rows-button", "show": ["show-actions"]})
  modes.push({"element": "delete-rows-button", "show": []})
  modes.push({"element": "edit-row-button", "show": ["edit-rows"]})
  modes.push({"element": "delete-row-button", "show": ["delete-rows"]})
  
//   modes.push({"element": "edit-row-header", "show": ["edit-rows"]})
  modes.push({"element": "delete-row-header", "show": ["delete-rows"]})
  
  modes.push({"element": "content-edit-cells", "show": ["edit-rows"]})
  
  

  for (let m of modes) {
    if (m.element === element) {
      for (s of m.show) {
        if (s === mode) { return true }
      }
    }
  }
  return false
}


function getAppInfo(app) {  
  let fm = FileManager.iCloud();
  let appFName = app + " app.json";
  let file = fm.joinPath(fm.documentsDirectory(), appFName);
  if (!fm.isFileDownloaded(file)) {
  	await(fm.downloadFileFromiCloud(file));
  }
  let appInfo = fm.readString(file);
  appInfo = JSON.parse(appInfo); 
  return appInfo
}

function hasHeader(pageName) {
  return appInfo.pages[pageName].showHeader
}

function parsePath(path, element) {
  const parsedPath = path.split("/")
  
  let pageName
  let id
  if (parsedPath.length === 1 ) {
    pageName = parsedPath[0] 
  } else {
    id = parsedPath[0]
    pageName = parsedPath[1] 
  }
  
  if (element === "id") {return id}
  if (element === "pageName") {return pageName}
}

function isPageEditable(pageName) {
  return appInfo.pages[pageName].editable
}



