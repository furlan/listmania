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
const pathSeparator = "/"
let editRowData
let breadCrumbs = appName

let table = new UITable()

updateTable(appInfo.app.rootPath, appInfo.app.startUpMode).then(() => {table.reload()}) 

table.present(true)

Script.complete()

async function updateTable(path, mode) {
  table.removeAllRows()
  const pageName = getPageName(path)
  let index = 0
  let row
  
  const rowsData = await model.getRowsData(path)
//   console.log("rowsData = " + rowsData)
  
    if (!hideListTitle(pageName)) {
      row = new UITableRow()  
      row.isHeader = true
      row.addText(appName, breadCrumbs)
      index = addRowAction(row, index)
    }
    
    
    if (getListActions(pageName).length > 0 && mode === 'actions-hidden') {
      row = new UITableRow()  
      row.isHeader = true
      oCell = row.addButton("ACTIONS 🔽")
      oCell.onTap = async () => {
        updateTable(path, 'actions-showed').then(() => {table.reload()})
      }
      index = addRowAction(row, index) // action button
      
      
    }
      
    if (getListActions(pageName).length > 0 && mode === 'actions-showed') {
      row = new UITableRow()  
      row.isHeader = true
//       row.backgroundColor = '#000000'
      oCell = row.addButton("HIDE ACTIONS 🔼")
      oCell.onTap = async () => {
        updateTable(path, 'actions-hidden').then(() => {table.reload()})
      }
      index = addRowAction(row, index)
        
//       row = new UITableRow()  
//       row.isHeader = true
//       oCell = row.addButton("🆕 New row")
//       oCell.onTap = async () => {
//       let newData
//         editRow(path + "/", newData)
//               .then(() => { updateTable(path, mode) })
//               .then(() => { table.reload() })
//       }
//       index = addRowAction(row, index)
      
      for (let action of getListActions(pageName)) {
        row = new UITableRow()  
        row.isHeader = true
        oCell = row.addButton(action.title)
        oCell.onTap = async () => {
          console.log("list action - path: " + path + " controller: " + action.controller)
          
//           let comm = "model." + action.controller + "(path, editRowData)"  
          eval(action.command)  
//           editRow(path + "/", {}).then(() => { updateTable(path, mode) }).then(() => { table.reload() })
          console.log("Eval ok: " + action.command)
          
          updateTable(path, mode).then(() => {table.reload()})
        }
      }
      index = addRowAction(row, index)
    }
    

      
//     if (hasToShow("add-row-button", mode)) {  
//       row = new UITableRow()  
//       row.isHeader = true
//       oCell = row.addButton("Add row 🆕")
//       oCell.onTap = async () => {
//         let newRowData = {}
//         for (let cell of appInfo.pages[pageName].cells) {
//           newRowData[cell.rowTitle] = "?"
//         }
//         addRow(pageName, newRowData)
//       }
//       index = addRowAction(row, index)
//     }
//     
//     if (hasToShow("edit-rows-button", mode)) {  
//       row = new UITableRow()  
//       row.isHeader = true
//       oCell = row.addButton("Edit rows 📝")
//       oCell.onTap = async () => {
//         updateTable(path, 'edit-rows').then(() => {table.reload()})
//       }
//       index = addRowAction(row, index)
//     }
//     
//     if (hasToShow("delete-rows-button", mode)) {  
//       row = new UITableRow()  
//       row.isHeader = true
//       oCell = row.addButton("Delete rows ❌")
//       oCell.onTap = async () => {
//         updateTable(path, 'delete-rows').then(() => {table.reload()})
//       }
//       index = addRowAction(row, index)
//     }
  
  
  // headers
  if (!hideListHeaders(pageName)) {
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
    
//     if (hasToShow("delete-row-button", mode)) {
//       oCell = row.addButton("❌")
//       let i = index
//       oCell.onTap = async () => {
//           await editRow(pageName, i)
//             .then(() => updateTable(pageName))
//             .then(() => table.reload())
//       }
//     }
//         
//       {
//       oCell = row.addButton("📝")
//       let i = index
//         oCell.onTap = async () => {
//           await editRow(pageName, i)
//             .then(() => updateTable(pageName, mode))
//             .then(() => table.reload())
//         }
//     }
    
    for (let cell of getCells(pageName)) {  
        let i = index
//         if (hasToShow("content-edit-cells", mode)) {  
//           oCell = row.addButton(rowData[cell.rowTitle].toString())
//           oCell.onTap = () => {  
//             editCell(pageName, cell.rowTitle, i)
//               .then(() => updateTable(pageName, mode))
//               .then(() => table.reload())
//           }
//         } else {
          // to-do: subtitle
          if (cell.onTap !== undefined) {
            oCell = row.addButton("🔡 [list]")
            oCell.onTap = () => {
//               console.log("navigate to: " + navTo(path, i, cell.onTap))
              updateTable(navTo(path, i, cell.onTap), 'actions-hidden').then(() => {table.reload()})
            }
          } else {
            row.addText(rowData[cell.rowTitle].toString())
            row.onSelect = async (number) => {
              editRow(path + "/" + i, rowData)
                .then(() => {
                  updateTable(path, 'actions-hidden')
                })
                .then(() => {table.reload()})
            }
          }
          
//         }
    }
    row.cellSpacing = 10
    index = addRowData(row, index)
  }
  
  if (appInfo.pages[pageName].onBack !== undefined) {
    let row = new UITableRow()
    let oCell = row.addButton("⏪ Back")
    oCell.onTap = async () => {
      await table.removeAllRows()
      updateTable(navBack(path), mode).then(() => table.reload())
    }
    index = addRowAction(row, index)
  }
}

function getPageName(path) {
  // Books/0/Authors --> Authors
  const parsedPath = path.split("/")
  
  if (isNaN(parsedPath[parsedPath.length - 1])) { return parsedPath[parsedPath.length - 1] }
  if (isNaN(parsedPath[parsedPath.length - 2])) { return parsedPath[parsedPath.length - 2] }
  
  return -1
}

function parsePath(path, element) {
  // Books/0/Authors --> Authors
  const parsedPath = path.split("/")
  
  let pageName
  let id
  if (parsedPath.length === 1 ) {
    pageName = parsedPath[0] 
  } else {
    pageName = parsedPath[0]
    id = parsedPath[1] 
  }
  
  if (element === "id") {return id}
  if (element === "pageName") {return pageName}
}

function navTo(path, id, page) {
  breadCrumbs +=  pathSeparator + page 
  return path + pathSeparator + id + pathSeparator + page
}

function navBack(path) {
  const pageName = getPageName(path)
  if (appInfo.pages[pageName].onBack !== undefined && appInfo.pages[pageName].onBack !== null ) {
    let pages = breadCrumbs.split(pathSeparator)
    pages.pop()
    breadCrumbs = ""
    for (page of pages) {
      breadCrumbs += page + pathSeparator
    }
    breadCrumbs = breadCrumbs.slice(0, breadCrumbs.length - 1)
    return appInfo.pages[pageName].onBack
  }
  return path
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

// async function showRow(pageName, id) {  
//   let rowData = await model.getRowData(pageName, id)
//     
//   let showRowTable = new UITable()
//   
//   let row
//   row.addButton("Back")
//   showRowTable.addRow(row)  
//   for (let cell of appInfo.pages[pageName].cells) {
//     row = new UITableRow()
//     row.addText(cell.headerTitle + ":")
//     row.addText(rowData[cell.rowTitle])
//     showRowTable.addRow(row)
//   }
//   
//   showRowTable.present()
//    
// }

// EDIT ROW >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
async function editRow(path, rowData) {  
  let editRowTable = new UITable()
//   console.log("editRow: " + path)
//   console.log(rowData)
  updateEditRowTable(editRowTable, path, rowData, "Enter new values.") 
  
  return editRowTable.present()
   
}

async function updateEditRowTable(editRowTable, path, initialRowData, message) { 
  editRowTable.removeAllRows()
  editRowData = initialRowData
  const id = parsePath(path, "id")
  const pageName = getPageName(path)
//   console.log(path + "|" + pageName)

  
  let row  = new UITableRow()
  row.addText("Edit row (" + pageName + ")", message)
  row.isHeader = true
  editRowTable.addRow(row)
  
  row  = new UITableRow()
  for (let action of getRowActions(pageName)) {
    let oCell
    oCell = row.addButton(action.title)
    oCell.onTap = () => {
      let comm = "model." + action.controller + "(path, editRowData)"  
//       console.log("row comm: " + comm)
      eval(comm)
      console.log("Eval ok: " + comm)
      
      
      updateEditRowTable(editRowTable, path, editRowData, message)  
        .then(() => editRowTable.reload())
    }    
  }
  editRowTable.addRow(row)
  for (let cell of getCells(pageName)) {
    row  = new UITableRow()
    row.addText(cell.headerTitle + ":")
    let buttonText
    if (cell.onTap === undefined) {
      
      if (editRowData[cell.rowTitle] === undefined) {
        buttonText = "?"
      } else {
        buttonText = editRowData[cell.rowTitle]
      }
      oCell = row.addButton(buttonText)
      
  //     let headerTitle = cell.headerTitle
      oCell.onTap = async () => {
  //       console.log("onTap cell")
        editRowCell(pageName, cell.headerTitle, editRowData[cell.rowTitle])
          .then((newValue) => {
            editRowData[cell.rowTitle] = newValue
            updateEditRowTable(editRowTable, path, editRowData, message)
          }).then(() => editRowTable.reload())
        } 
      } else {
        row.addText("🔡 [list]")
      }
    editRowTable.addRow(row)
  }

}

async function editRowCell(pageName, rowTitle, value) {
//   console.log("editRowCell")
  let edit = new Alert()
  
  edit.title = "Value for " + pageName
  edit.message = "Enter new values"
  edit.addTextField(value, value)
  
  edit.addAction("OK")
  edit.addCancelAction("Cancel")
  let action = await edit.present()
  if (action !== -1) { return edit.textFieldValue(0) }
  if (action === -1) { return value }
  
}
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> EDIT ROW 


// async function addRow(pageName, newRowData) {  
//   let addNewRowTable = new UITable()
//   
//   updateAddNewRowTable(addNewRowTable, pageName, newRowData)
//   
//   addNewRowTable.present().then(() => {
//     model.setRowData(pageName, null, addNewRowData)
//   })
//    
// }
// 
// async function updateAddNewRowTable(addNewRowTable, pageName, newRowData) { 
//   addNewRowTable.removeAllRows()
//   addNewRowData = newRowData
//   
//   let row, oCell
//   row.addButton("Back")
//   showRowTable.addRow(row)  
//   for (let cell of appInfo.pages[pageName].cells) {
//     row = new UITableRow()
//     row.addText(cell.headerTitle + ":")
//     oCell = row.addButton(addNewRowData[cell.rowTitle])
//     let headerTitle = cell.headerTitle
//     oCell.onTap = () => {
//       console.log("onTap cell")
//       editNewCell(pageName, cell.headerTitle, addNewRowData[cell.rowTitle])
//         .then((newValue) => {
//           addNewRowData[cell.rowTitle] = newValue
//           updateAddNewRowTable(addNewRowTable, pageName, addNewRowData)
//         }).then(() => addNewRowTable.reload())
//     }
//     addNewRowTable.addRow(row)
//   }
// }
// 
// async function editNewCell(pageName, rowTitle, value) {
//   console.log("editNewCell")
//   let edit = new Alert()
//   
//   edit.title = "Value for " + pageName
//   edit.message = "Enter new values"
//   edit.addTextField(value)
//   
//   edit.addAction("OK")
//   edit.addCancelAction("Cancel")
//   let action = await edit.present()
//   if (action !== -1) { return edit.textFieldValue(0) }
//   if (action === -1) { return value }
//   
// }
// 
// async function editCell(pageName, rowTitle, id) {
//   console.log("::editRow (id): " + id + "/" + pageName)
//   let rowData = await model.getRowData(pageName, id)
//   let edit = new Alert()
// 
//   for (let cell of appInfo.pages[pageName].cells) {
//     if (cell.rowTitle === rowTitle) {
//       edit.title = "Edit: " + pageName + ">" + cell.headerTitle
//       edit.message = "Enter new values"
//       edit.addTextField(cell.headerTitle, rowData[cell.rowTitle])
//     }
//   }
//   
//   edit.addAction("Save")
//   edit.addDestructiveAction("Delete Row")
//   edit.addCancelAction("Cancel")
//   let action = await edit.present()
//   console.log("actin" + action)
//   if (action === 0) {
//     for (let cell of appInfo.pages[pageName].cells) {
//       if (cell.rowTitle === rowTitle) {  
//         rowData[cell.rowTitle] = edit.textFieldValue(0)
//       }
//     }
//     return await model.setRowData(pageName, id, rowData) 
//   }
//   
//   if (action === 1) {
//     return await model.removeRow(pageName, id)
//   }
//   
// }

// async function editRow(pageName, id) {
//   console.log("::editRow (id): " + id + "/" + pageName)
//   let rowData = await model.getRowData(pageName, id)
//   let edit = new Alert()
//   
//   edit.title = "Edit row for " + pageName
//   edit.message = "Enter new values"
//   
//   for (let cell of appInfo.pages[pageName].cells) {
//     edit.addTextField(cell.headerTitle, rowData[cell.rowTitle])
//   }
//   
//   edit.addAction("Save")
//   edit.addDestructiveAction("Delete Row")
//   edit.addCancelAction("Cancel")
//   let action = await edit.present()
//   
//   if (action === 0) {
//     let i = 0
//     for (let cell of appInfo.pages[pageName].cells) {
//       rowData[cell.rowTitle] = edit.textFieldValue(i)
//       i++
//     }
//   }
//   return await model.setRowData(pageName, id, rowData)
// }

function hasToShow(element, mode) {
  let modes = []
//   modes.push({"element": "page-header", "show": ["read-only", "show-actions", "edit-rows"]})
  modes.push({"element": "unhide-actions-button", "show": ["read-only"]})
  modes.push({"element": "hide-actions-button", "show": ["show-actions", "edit-rows"]})
//   modes.push({"element": "add-row-button", "show": ["show-actions", "edit-rows"]})
//   modes.push({"element": "edit-rows-button", "show": ["show-actions"]})
//   modes.push({"element": "delete-rows-button", "show": []})
//   modes.push({"element": "edit-row-button", "show": ["edit-rows"]})
//   modes.push({"element": "delete-row-button", "show": ["delete-rows"]})
  
//   modes.push({"element": "edit-row-header", "show": ["edit-rows"]})
//   modes.push({"element": "delete-row-header", "show": ["delete-rows"]})
  
//   modes.push({"element": "content-edit-cells", "show": ["edit-rows"]})
  
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

function hideListTitle(pageName) {
  return appInfo.pages[pageName].hideListTitle
}

function hideListHeaders(pageName) {
  return appInfo.pages[pageName].hideListHeaders
}

function isPageEditable(pageName) {
  return appInfo.pages[pageName].editable
}

function getCells(pageName) {
  return appInfo.pages[pageName].cells
}

function getListActions(pageName) {
  let actions = []
  let listActions = []
  // Standards actions
  let hasNewRowAction = false
  
  for (listAction of appInfo.pages[pageName].listActions) {
    if (listAction.title === "🆕 New row") { hasNewRowAction = true }
    listActions.push(listAction)
  }
  
  if (!hasNewRowAction) { 
    listActions.push({"title": "🆕 New row", "controller": "", "hide": false})
  }
  
  for (listAction of listActions) {
    let action = {}
    if (listAction.title === "🆕 New row" && listAction.controller === "") {
      action.command = "editRow(path + \"/\", {}).then(() => { updateTable(path, mode) }).then(() => { table.reload() })"
    } else { 
        action.command = "model." + action.controller + "(path, editRowData)"
    }
    if (!listAction.hide || listAction.hide === undefined) {
      action.title = listAction.title
      actions.push(action)
    }
  }
  
  return actions
}

function getRowActions(pageName) {
  let actions = []
  let listActions = []
  // Standards routines
  let hasSaveAction = false
  let hasDeleteAction = false
  
  for (listAction of appInfo.pages[pageName].rowActions) {
    if (listAction.title === "💾 Save changes") { 
      hasSaveAction = true
      if (listAction.controller === "") {listAction.controller = "setRowData"}
     }
    if (listAction.title === "🗑 Delete row") { 
      hasDeleteAction = true
      if (listAction.controller === "") {listAction.controller = "removeRow"}
     }
    listActions.push(listAction)
  }
  
  if (!hasSaveAction) { 
    listActions.push({"title": "💾 Save changes", "controller": "setRowData", "hide": false})
  }
  
  if (!hasDeleteAction) { 
    listActions.push({"title": "🗑 Delete row", "controller": "removeRow", "hide": false})
  }
  
  for (listAction of listActions) {
    let action = {}
    if (!listAction.hide) { actions.push(listAction) }
  }
  
  return actions
}
