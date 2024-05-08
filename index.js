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

  setInterval(async () => {
    if (counter < roll_numbers.length) {
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
    } else {
      clearInterval()
    }
  }, 200)
}

main()

