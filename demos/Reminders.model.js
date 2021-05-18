// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: teal; icon-glyph: magic;
module.exports.getRowsData = async (id, model) => {
  if (model === 'Lists') { return await getLists(id) }
  if (model === 'Reminders') { 
    const r = await getReminders(id) 
    return r}
}

async function getLists (id){
  console.log("::Lists")
  let fm = FileManager.iCloud()
  let fName = "Lists.json"
  let file = fm.joinPath(fm.documentsDirectory(), fName)
  if (!fm.isFileDownloaded(file)) {
  	await(fm.downloadFileFromiCloud(file))
  }
  let lists = fm.readString(file)
  lists = JSON.parse(lists)
  
  let calendars = []
  for (list of lists) {
    let cal = await Calendar.forRemindersByTitle(list.Name)  
    calendars.push(cal)
  }
//   console.log(calendars)
  
//   let remindersRaw = await Reminder.allDueToday(calendars)
//   console.log(remindersRaw)
  
  Reminder.allDueToday(calendars).then((remindersRaw) => {
//     console.log(remindersRaw)
    let reminders = []
    for (r of remindersRaw) {
        reminders.push({"title": r.title, "dueDate": r.dueDate, "calendar": r.calendar.title})
    }
    reminders = JSON.stringify(reminders)
    
    fm = FileManager.local()
    file = fm.joinPath(fm.documentsDirectory(), "Reminders_query.json")
    fm.writeString(file, reminders)
//     console.log(reminders)
  })  
  
  return lists
}

async function getReminders (id){
  console.log("::Reminders")
  let fm = FileManager.iCloud()
  let fName = "Lists.json"
  let file = fm.joinPath(fm.documentsDirectory(), fName)
  if (!fm.isFileDownloaded(file)) {
  	await(fm.downloadFileFromiCloud(file))
  }
  let lists = fm.readString(file)
  lists = JSON.parse(lists)
  
  fm = FileManager.local()
  file = fm.joinPath(fm.documentsDirectory(), "Reminders_query.json")
  let remindersRaw = fm.readString(file)
  remindersRaw = JSON.parse(remindersRaw)

  let reminders = []
  for (r of remindersRaw) {
    if (r.calendar === lists[id].Name ) {
      reminders.push({"title": r.title, "dueDate": r.dueDate})
    }
  }
//   console.log(reminders)
  
  return reminders
}
