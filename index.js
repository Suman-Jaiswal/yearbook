const fs = require('fs')
let users = []

async function fetchUsers() {
  const response = await fetch('https://yearbookbackend.profiles.iiti.ac.in/getUsersData',)
  users = await response.json()
}

async function fetchComments(roll_no) {
  const response = await fetch('https://yearbookbackend.profiles.iiti.ac.in/getRecieversComments2', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      "comment_reciever_roll_number": roll_no,
      "isStudent": false
    })
  })
  return await response.json()
}



async function main() {
  await fetchUsers()

  let students = []
  let roll_numbers = []
  for (let index = 0; index < users.length; index++) {
    const element = users[index];
    students.push({ name: element.name, roll_no: element.roll_no })
    roll_numbers.push(element.roll_no)
  }

  fs.writeFileSync('students.json', JSON.stringify(students))
  fs.writeFileSync('roll_numbers.json', JSON.stringify(roll_numbers))
  let counter = 0
  const limit = roll_numbers.length
  setInterval(async () => {
    if (counter < limit) {
      let comments_data = []
      const roll_no = roll_numbers[counter]
      let comments = await fetchComments(roll_no)
      if (!comments || !comments.approvedComments || comments.approvedComments.length === 0) {
        console.log(`${counter}. No comments for roll number ${roll_no}`)
        counter++
        return
      }
      for (let index = 0; index < comments.approvedComments.length; index++) {
        const element = comments.approvedComments[index];
        const comment = {
          comment: element.comment,
          name: element.name,
        }
        comments_data.push(comment)
      }
      fs.writeFileSync(`roll_${roll_no}.json`, JSON.stringify(comments_data))
      console.log(`${counter}. Comments for roll number ${roll_no} fetched`)
      counter++
    } else if (counter === limit) {
      getYearBook()
      counter++
    } else {
      clearInterval()
    }
  }, 200)


}

function fetchCommentsJson(roll_no) {
  try {
    const comments = require(`./roll_${roll_no}.json`)
    return comments
  } catch (error) {
    return []
  }
}
async function getYearBook() {
  const students = require('./students.json')
  let yearBook = []
  for (let index = 0; index < students.length; index++) {
    const student = students[index];
    const roll_no = student.roll_no
    const comments = fetchCommentsJson(roll_no)
    yearBook.push({ roll_no: roll_no, name: student.name, comments: comments })
  }
  fs.writeFileSync('yearbook.json', JSON.stringify(yearBook))
  console.log('Yearbook Updated');
}

main()

