
let students = []
let yearBook = []

async function fetchCommentsJson(roll_no) {
  return await fetch(`./roll_${roll_no}.json`).then(response => response.json()).catch(error => [])
}

async function getYearBook() {
  return await fetch('./yearbook.json').then(response => response.json()).catch(error => [])
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

  yearBook = await getYearBook();

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

document.querySelector('.stat-btn').addEventListener('click', () => {
  document.querySelector('.stats').style.transform = 'scale(1)'
  document.querySelector('.comments').style.display = 'none'
  document.querySelector('.students-container').style.display = 'none'
  renderStats()
})

document.querySelector('.close').addEventListener('click', () => {
  document.querySelector('.stats').style.transform = 'scale(0)'
  document.querySelector('.comments').style.display = 'flex'
  document.querySelector('.students-container').style.display = 'flex'
})

function renderStats() {
  const totalStudentsElement = document.querySelector('#total-students')
  totalStudentsElement.innerText = students.length
  const totalCommentsElement = document.querySelector('#total-comments')
  let totalComments = 0
  yearBook.forEach(student => {
    totalComments += student.comments.length
  })
  totalCommentsElement.innerText = totalComments
  const ul = document.querySelector('.top10-recieved')
  ul.innerHTML = ''
  yearBook.sort((a, b) => b.comments.length - a.comments.length)
  yearBook.slice(0, 10).forEach((student, index) => {
    const li = document.createElement('li')
    li.style.cursor = 'pointer'
    li.classList.add('ranker')
    li.innerHTML = `<div class="stat-name"> ${index + 1}. ${student.name}</div>  <h4>${student.comments.length}</h4>`
    li.onclick = async () => {
      document.querySelectorAll('.student').forEach(element => {
        element.classList.remove('selected')
      })
      document.querySelectorAll('.ranker').forEach(element => {
        element.style.fontWeight = 'normal'
      })
      li.style.fontWeight = 'bold'
      const comments = await fetchCommentsJson(student.roll_no)
      renderComments(comments)
    }
    ul.appendChild(li)
  })

  const ul2 = document.querySelector('.top10-sent')
  ul2.innerHTML = ''
  let rankers = {};
  for (let index = 0; index < yearBook.length; index++) {
    const comments = yearBook[index].comments;
    for (let index2 = 0; index2 < comments.length; index2++) {
      const comment = comments[index2];
      if (comment.roll_no === 'anonymous' || comment.roll_no === undefined) {
        continue;
      }
      rankers[comment.roll_no] = rankers[comment.roll_no] ? { name: comment.name, count: rankers[comment.roll_no].count + 1 } : { name: comment.name, count: 1 }
    }
  }

  const rankersRolls = Object.keys(rankers).sort((a, b) => rankers[b].count - rankers[a].count).slice(0, 10);

  for (let index = 0; index < rankersRolls.length; index++) {
    const element = rankersRolls[index];
    const li = document.createElement('li')
    li.style.cursor = 'pointer'
    li.classList.add('ranker')
    li.innerHTML = `<div class="stat-name"> ${index + 1}. ${rankers[element].name}</div>  <h4>${rankers[element].count}</h4>`
    li.onclick = async () => {
      document.querySelectorAll('.student').forEach(element => {
        element.classList.remove('selected')
      })
      document.querySelectorAll('.ranker').forEach(element => {
        element.style.fontWeight = 'normal'
      })
      li.style.fontWeight = 'bold'
      const comments = await fetchCommentsJson(element)
      renderComments(comments)
    }
    ul2.appendChild(li)
  }
}

bootstrap()