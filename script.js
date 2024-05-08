
let students = []
let yearBook = []

async function fetchCommentsJson(roll_no) {
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

  for (let index = 0; index < students.length; index++) {
    const student = students[index];
    await getYearBook(student)
  }

  console.log(yearBook);
  renderStats()
}

function initListener() {
  const studentElements = document.querySelectorAll('.student')
  studentElements.forEach(element => {
    element.addEventListener('click', async (event) => {
      document.querySelector('.cur').scrollIntoView({ behavior: 'smooth', block: 'center' })
      studentElements.forEach(element => {
        element.classList.remove('selected')
      }
      )
      element.classList.add('selected')
      const roll_no = element.querySelector('.roll').innerText
      console.log(roll_no);
      const comments = await fetchCommentsJson(roll_no)
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


async function getYearBook(student) {
  const roll_no = student.roll_no
  const comments = await fetchCommentsJson(roll_no)
  if (!comments || comments.length === 0) {
    return
  }
  yearBook.push({ roll_no: roll_no, name: student.name, comments: comments })
}

function renderStats() {
  const totalStudentsElement = document.querySelector('#total-students')
  totalStudentsElement.innerText = students.length
  const totalCommentsElement = document.querySelector('#total-comments')
  let totalComments = 0
  yearBook.forEach(student => {
    totalComments += student.comments.length
  })
  totalCommentsElement.innerText = totalComments
  const ul = document.querySelector('.top10')
  yearBook.sort((a, b) => b.comments.length - a.comments.length)
  yearBook.slice(0, 10).forEach((student, index) => {
    const li = document.createElement('li')
    li.innerHTML = `<div> ${index + 1}. ${student.name}</div>  <h3>${student.comments.length}</h3>`
    ul.appendChild(li)
  })
}

bootstrap()