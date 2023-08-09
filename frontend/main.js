function formatDate(date) {

  let dd = new Date(date).getDate();
  if (dd < 10) dd = '0' + dd;

  let mm = new Date(date).getMonth() + 1;
  if (mm < 10) mm = '0' + mm;

  let yy = new Date(date).getFullYear();
  if (yy < 10) yy = '0' + yy;

  return dd + '.' + mm + '.' + yy;
}

const SERVER_URL = 'http://localhost:3000';

async function serverAddStudent(obj) {
  let response = await fetch(SERVER_URL + '/api/students', {
    method: "POST",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(obj),
  })

  let data = await response.json();
  return data
}

async function serverGetStudent() {
  let response = await fetch(SERVER_URL + '/api/students', {
    method: "GET",
    headers: { 'Content-Type': 'application/json' },
  })
  let data = await response.json();
  return data
}

let serverData = await serverGetStudent();

let studentsList = [];
if (serverData !== null) {
  studentsList = serverData;
}

console.log(await serverGetStudent());

async function serverDeleteStudent(id) {
  let response = await fetch(SERVER_URL + '/api/students/' + id, {
    method: "DELETE",
  })
  let data = await response.json();
  return data
}


function getStudentItem(studentObj) {

  const $tableBody = document.getElementById('tbody');
  const $userTr = document.createElement('tr'),
    $userFio = document.createElement('td'),
    $userBirthDate = document.createElement('td'),
    $userstudyStart = document.createElement('td'),
    $userfaculty = document.createElement('td'),
    $userDelete = document.createElement('button');

  let now = new Date(); //Текущя дата
  let today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); //Текущя дата без времени
  let dob = new Date(studentObj.birthday);
  let ey = new Date(studentObj.studyStart);
  let dobnow = new Date(today.getFullYear(), dob.getMonth(), dob.getDate()); //ДР в текущем году
  let age = today.getFullYear() - dob.getFullYear();
  if (today < dobnow) {
    age = age - 1;
  }
  let course = today.getFullYear() - ey.getFullYear();
  let educationEnd = ey.getFullYear() + 4;
  if (now < new Date(now.getFullYear(), 8, 1)) {
    course = `(${course} курс)`
  } else if (now < new Date(now.getFullYear(), 8, 1)) {
    course = `(${course + 1} курс)`
  }
  if (now.getFullYear() > educationEnd) {
    course = 'закончил';
  }

  $userFio.textContent = studentObj.surname + ' ' + studentObj.name + ' ' + studentObj.lastname;
  $userBirthDate.textContent = formatDate(studentObj.birthday) + ' (' + `${age}` + ' лет)';
  $userstudyStart.textContent = `${ey.getFullYear()}` + '-' + `${educationEnd}` + ' ' + course
  $userfaculty.textContent = studentObj.faculty;
  $userDelete.textContent = 'Удалить';

  $userTr.append($userFio);
  $userTr.append($userBirthDate);
  $userTr.append($userstudyStart);
  $userTr.append($userfaculty);
  $userTr.append($userDelete);
  $tableBody.append($userTr);

  $userDelete.classList.add('btn', 'btn-danger', 'mb-2', 'mt-2');

  $userDelete.addEventListener('click', async function () {
    await serverDeleteStudent(studentObj.id);
    $userTr.remove();
    alert('Студент отчислен 😔')
  })

  return $userTr;
}

function renderStudentsTable(studentsArray) {
  let copy = [...studentsArray];
  // filter
  if ($fioFilterInp.value.trim() !== '') {
    copy = copy.filter(function (studentObj) {
      if (studentObj.name.toLowerCase().includes($fioFilterInp.value.toLowerCase().trim()) || studentObj.surname.toLowerCase().includes($fioFilterInp.value.toLowerCase().trim()) || studentObj.lastname.toLowerCase().includes($fioFilterInp.value.toLowerCase().trim())) {
        return true
      }
    })
  }

  if ($dateOfStartFilterInp.value.trim() !== '') {
    copy = copy.filter(function (userOne) {
      if (new Date(userOne.studyStart).getFullYear() == (new Date($dateOfStartFilterInp.value).getFullYear())) {
        return true
      }
    })
  }

  if ($dateOfEndFilterInp.value.trim() !== '') {
    copy = copy.filter(function (userOne) {
      if (new Date(userOne.studyStart).getFullYear() + 4 == (new Date($dateOfEndFilterInp.value).getFullYear())) {
        return true
      }
    })
  }

  if ($facultyFilterInp.value.trim() !== '') {
    copy = copy.filter(function (userOne) {
      if (userOne.faculty.toLowerCase().includes($facultyFilterInp.value.toLowerCase().trim())) {
        return true
      }
    })
  }
  const $tableBody = document.getElementById('tbody')
  $tableBody.innerHTML = '';

  // sort
  copy = copy.sort(function (a, b) {
    let sort = a[sortColumnFlag] < b[sortColumnFlag]
    if (sortDirFlag == false) {
      sort = a[sortColumnFlag] > b[sortColumnFlag];
    }
    if (sort) return -1
  });

  for (const studObj of copy) {
    const $newUserTr = getStudentItem(studObj);
    $tableBody.append($newUserTr);
  }

  return copy
}

function validation(form) {
  let now = new Date(); //Текущя дата
  function removerErorr(input) {
    const parent = input.parentNode;
    if (parent.classList.contains('error')) {
      parent.querySelector('label').remove();
      parent.classList.remove('error')
    }
  }

  function createError(input, text) {
    const parent = input.parentNode;
    const errorLabel = document.createElement('label');
    errorLabel.classList.add('error-label');
    errorLabel.textContent = text;
    parent.classList.add('error');
    parent.append(errorLabel);
  }

  let result = true;
  const allInputs = form.querySelectorAll('input')
  for (const input of allInputs) {

    removerErorr(input)

    if (input.dataset.birthDate == 'true') {
      if (new Date(input.value.trim()) < new Date(1900, 0, 1)) {
        removerErorr(input)
        createError(input, 'Ничего себе вы старый! Дорогу молодым!')
        result = false;
      }
    }

    if (input.dataset.birthDate == 'true') {
      if (new Date(input.value.trim()) > now) {
        removerErorr(input)
        createError(input, 'Вы еще не родились?')
        result = false;
      }
    }

    if (input.dataset.dateOfLearning == 'true') {
      if (input.value.trim() < 2000) {
        removerErorr(input)
        createError(input, 'Университет открылся в 2000 году ')
        result = false;
      }
    }

    if (input.dataset.dateOfLearning == 'true') {
      if (input.value > now.getFullYear()) {
        removerErorr(input)
        createError(input, 'Этот день еще не наступил 🤔')
        result = false;
      }
    }

    if (input.dataset.required == 'true') {
      if (input.value.trim() == '') {
        removerErorr(input)
        createError(input, 'Необходимо ввести данные для отправки формы!')
        result = false;
      }
    }

    if (input.dataset.surname == 'true') {
      if (input.value.trim() == '') {
        removerErorr(input);
        createError(input, 'Введите вашу фамилию!')
        result = false;
      }
    }

    if (input.dataset.name == 'true') {
      if (input.value.trim() == '') {
        removerErorr(input);
        createError(input, 'Введите ваше имя!')
        result = false;
      }
    }

    if (input.dataset.lastname == 'true') {
      if (input.value.trim() == '') {
        removerErorr(input);
        createError(input, 'Введите ваше отчество!')
        result = false;
      }
    }

    if (input.dataset.facultee == 'true') {
      if (input.value.trim() == '') {
        removerErorr(input);
        createError(input, 'Введите название вашего факультета!')
        result = false;
      }
    }

  }
  return result
}
const $addStudent = document.getElementById('add-student');
$addStudent.addEventListener('submit', async function (event) {
  event.preventDefault();
  const $surnameInp = document.getElementById('add-student__surname-inp'),
    $nameInp = document.getElementById('add-student__name-inp'),
    $lastnameInp = document.getElementById('add-student__lastname-inp'),
    $facultyInp = document.getElementById('add-student__facultee-inp'),
    $birthDateInp = document.getElementById('add-student__birth-date-inp'),
    $studyYearInp = document.getElementById('add-student__study-year-inp');
  document.getElementById('tbody')


  if (validation(this) == true) {
    let newStudentObj = {
      name: $nameInp.value.trim()[0].toUpperCase() + $nameInp.value.trim().slice(1),
      surname: $surnameInp.value.trim()[0].toUpperCase() + $surnameInp.value.trim().slice(1),
      lastname: $lastnameInp.value.trim()[0].toUpperCase() + $lastnameInp.value.trim().slice(1),
      birthday: new Date($birthDateInp.value.trim()),
      studyStart: new Date($studyYearInp.value.trim()),
      faculty: $facultyInp.value.trim()[0].toUpperCase() + $facultyInp.value.trim().slice(1)
    }
    let serverDataObj = await serverAddStudent(newStudentObj);
    serverDataObj.birthday = new Date(serverDataObj.birthday);
    studentsList.push(serverDataObj);
    event.target.reset();
    alert('Студент успешно добавлен!😎')
    renderStudentsTable(studentsList);
  }

})

let sortDirFlag = true;
let sortColumnFlag = 'fio';

const fioSort = document.getElementById('fio'),
  birthday = document.getElementById('birthday'),
  educatioStart = document.getElementById('education-start'),
  faculty = document.getElementById('facultee');

fioSort.addEventListener('click', function () {
  console.log('Отсортировано по ФИО');
  sortDirFlag = !sortDirFlag;
  renderStudentsTable(studentsList)
})

birthday.addEventListener('click', function () {
  console.log('Отсортировано по дате рождения');
  sortColumnFlag = 'birthday'
  sortDirFlag = !sortDirFlag;
  renderStudentsTable(studentsList)
})

educatioStart.addEventListener('click', function () {
  console.log('Отсортировано по году начала обучения');
  sortColumnFlag = 'studyStart'
  sortDirFlag = !sortDirFlag;
  renderStudentsTable(studentsList)
});

faculty.addEventListener('click', function () {
  console.log('Отсортировано по названию факультета');
  sortColumnFlag = 'faculty'
  sortDirFlag = !sortDirFlag;
  renderStudentsTable(studentsList)
});

const $filterForm = document.getElementById('filter-form'),
  $fioFilterInp = document.getElementById('filter-form__fio-inp'),
  $dateOfStartFilterInp = document.getElementById('filter-form__start-inp'),
  $dateOfEndFilterInp = document.getElementById('filter-form__end-inp'),
  $facultyFilterInp = document.getElementById('filter-form__facultee');

$filterForm.addEventListener('submit', function (event) {
  event.preventDefault()
})

// Фильтрация
// function filter(arr, prop, value) {
//   return arr.filter(function (item) {
//     if (item[prop].includes(value.trim()))
//       return true;
//   })
// }


$fioFilterInp.addEventListener('input', function () {
  renderStudentsTable(studentsList)
})


$dateOfStartFilterInp.addEventListener('input', function () {
  renderStudentsTable(studentsList)
})

$dateOfEndFilterInp.addEventListener('input', function () {
  renderStudentsTable(studentsList)
})

$facultyFilterInp.addEventListener('input', function () {
  renderStudentsTable(studentsList)
})



renderStudentsTable(studentsList)


