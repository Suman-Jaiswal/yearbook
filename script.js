

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
  for (let index = 0; index < users.length; index++) {
    const element = users[index];
    students.push({ name: element.name, roll_no: element.roll_no })
  }

  // fs.writeFileSync('students.json', JSON.stringify(students))

  // let counter = 0

  // setInterval(async () => {
  //   if (counter < roll_numbers.length) {
  //     let comments_data = []
  //     const roll_no = roll_numbers[counter]
  //     // let comments = await fetchComments(roll_no)
  //     // if (!comments || !comments.approvedComments || comments.approvedComments.length === 0) {
  //     //   log(`No comments for roll number ${roll_no}`)
  //     //   counter++
  //     //   return
  //     // }
  //     // for (let index = 0; index < comments.approvedComments.length; index++) {
  //     //   const element = comments.approvedComments[index];
  //     //   const comment = {
  //     //     comment: element.comment,
  //     //     name: element.name,
  //     //   }
  //     //   comments_data.push(comment)
  //     // }
  //     log(`Comments for roll number ${roll_no} fetched`)
  //     counter++
  //   } else {
  //     clearInterval()
  //   }
  // }, 10)
}

let students = []

async function fetchComments(roll_no) {
  return await fetch(`./roll_${roll_no}.json`).then(response => response.json()).catch(error => [])
}

function renderStudents(alphabet) {
  const studentsElement = document.querySelector('.students')
  studentsElement.innerHTML = ''
  students.forEach(student => {
    if (student.name[0] === alphabet) {
      const studentElement = document.createElement('div')
      studentElement.classList.add('student')
      const rollElement = document.createElement('div')
      rollElement.classList.add('roll')
      rollElement.innerText = student.roll_no
      const nameElement = document.createElement('div')
      nameElement.classList.add('name')
      nameElement.innerHTML = student.name
      studentElement.appendChild(nameElement)
      studentElement.appendChild(rollElement)
      studentsElement.appendChild(studentElement)
    }
  })
  if (studentsElement.innerHTML === '') {
    studentsElement.innerHTML = 'No students found'
  }
  initListener()
}

function renderComments(comments) {
  const commentsElement = document.querySelector('.comments')
  commentsElement.innerHTML = ''
  if (!comments || comments.length === 0) {
    commentsElement.innerHTML = 'No comments found'
    return
  }
  comments.forEach(comment => {
    const commentElement = document.createElement('div')
    commentElement.classList.add('comment')
    const nameElement = document.createElement('div')
    nameElement.classList.add('comment-name')
    nameElement.innerText = '~ ' + comment.name
    const commentTextElement = document.createElement('div')
    commentTextElement.classList.add('comment-text')
    commentTextElement.innerText = comment.comment
    commentElement.appendChild(commentTextElement)
    commentElement.appendChild(nameElement)
    commentsElement.appendChild(commentElement)
  })
}

async function bootstrap() {
  const response = await fetch('./students.json')
  if (!response) {
    console.log('No students found')
    return
  }
  students = await response.json()
  console.log(students);
  students.sort((a, b) => a.name.localeCompare(b.name))

  document.querySelector('#S').classList.add('selected')
  renderStudents('S')

  const alphabetElements = document.querySelectorAll('.alphabet')
  alphabetElements.forEach(element => {
    element.addEventListener('click', async (event) => {
      const alphabet = event.target.innerText
      renderStudents(alphabet)
      alphabetElements.forEach(element => {
        element.classList.remove('selected')
      })
      element.classList.add('selected')
    })
  })
}

function initListener() {
  const studentElements = document.querySelectorAll('.student')
  studentElements.forEach(element => {
    element.addEventListener('click', async (event) => {
      studentElements.forEach(element => {
        element.classList.remove('selected')
      }
      )
      element.classList.add('selected')
      const roll_no = element.querySelector('.roll').innerText
      console.log(roll_no);
      const comments = await fetchComments(roll_no)
      renderComments(comments)
    })
  })
}

document.querySelector('.search').addEventListener('input', (event) => {
  const search = event.target.value
  const studentsElement = document.querySelector('.students')
  studentsElement.innerHTML = ''
  students.forEach(student => {
    if (student.name.toLowerCase().includes(search.toLowerCase())) {
      const studentElement = document.createElement('div')
      studentElement.classList.add('student')
      const rollElement = document.createElement('div')
      rollElement.classList.add('roll')
      rollElement.innerText = student.roll_no
      const nameElement = document.createElement('div')
      nameElement.classList.add('name')
      nameElement.innerHTML = student.name
      studentElement.appendChild(nameElement)
      studentElement.appendChild(rollElement)
      studentsElement.appendChild(studentElement)
    }
  })
  if (studentsElement.innerHTML === '') {
    studentsElement.innerHTML = 'No students found'
  }
  initListener()
})

bootstrap()
// main()