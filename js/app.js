const MIN_DATE = "1800-01-01";
const MAX_DATE_IN_LV_OLD = "2017-06-30";
const MAX_DATE_IN_EE_LT = "2099-12-31";
const EE_LT = "EE-LT";
const LV_OLD = "LV-old";
const LV_NEW = "LV-new";
const EE_LT_REGEX = /^[1-6]\d{2}(((0[13578]|1[02])(0[1-9]|[12]\d|3[01]))|((0[469]|11)(0[1-9]|[12]\d|30))|(02(0[1-9]|1\d|2[0-9])))\d{4}$/;
const LV_OLD_REGEX = /^(((0[1-9]|[12]\d|3[01])(0[13578]|1[02]))|((0[1-9]|[12]\d|30)(0[469]|11))|((0[1-9]|1\d|2[0-9])02))\d{2}-[0-2]\d{4}$/;
const LV_NEW_REGEX = /^3[2-9]\d{4}-?\d{5}$/;

const idGeneratorForm = document.getElementById("id-generator-form");
const countryElement = document.getElementById("country");
const idCodeElement = document.getElementById("id-code");
const genderContainer = document.getElementById("gender-container");
const dateOfBirthElement = document.getElementById("date-of-birth");
const dateOfBirthContainer = document.getElementById("date-of-birth-container");
const ageContainer = document.getElementById("age-container");
const ageElement = document.getElementById("age");
const secondLvDigitContainer = document.getElementById("second-LV-digit-container");
const secondLvDigitElement = document.getElementById("second-LV-digit");
const maxDateAsTodayContainer = document.getElementById("max-date-container");
const maxDateAsTodayElement = document.getElementById("max-date");

document.addEventListener("DOMContentLoaded", () => {
  setMaxDateASToday();
  setMaxAgeBasedOnMinDate();
  maxDateAsTodayElement.title = "Checked - today, unchecked - " + MAX_DATE_IN_EE_LT;
});

countryElement.addEventListener("change", (event) => {
  dateOfBirthElement.value = "";
  secondLvDigitContainer.style.display = "none";
  idCodeElement.value = "";
  idCodeElement.classList.remove("valid", "invalid");
  ageElement.value = "";
  secondLvDigitElement.value = "2";

  const country = event.target.value;
  if (country === LV_OLD) {
    genderContainer.style.display = "none";
    dateOfBirthContainer.style.display = "";
    ageContainer.style.display = "";
    maxDateAsTodayContainer.style.display = "none";
    dateOfBirthElement.max = MAX_DATE_IN_LV_OLD;
  } else if (country === LV_NEW) {
    genderContainer.style.display = "none";
    dateOfBirthContainer.style.display = "none";
    ageContainer.style.display = "none";
    secondLvDigitContainer.style.display = "";
    maxDateAsTodayContainer.style.display = "none";
  } else if (country === EE_LT) {
    genderContainer.style.display = "";
    dateOfBirthContainer.style.display = "";
    ageContainer.style.display = "";
    setMaxDateASToday();
  }
});

maxDateAsTodayElement.addEventListener("change", () => {
  dateOfBirthElement.value = "";
  if (maxDateAsTodayElement.checked) {
    setMaxDateASToday();
  } else {
    dateOfBirthElement.max = MAX_DATE_IN_EE_LT;
  }
});

function setMaxDateASToday() {
  dateOfBirthElement.max = new Date().toISOString().slice(0, 10);
}

function setMaxAgeBasedOnMinDate() {
  const today = new Date();
  const minDate = new Date(MIN_DATE);
  ageElement.max = today.getFullYear() - minDate.getFullYear();
}

idGeneratorForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const country = countryElement;
  let personalCode = "";

  if (country && country.value) {
    if (country.value === EE_LT) {
      personalCode = generateEeLtIdCode();
    } else if (country.value === LV_OLD) {
      personalCode = generateLvOldIdCode();
    } else if (country.value === LV_NEW) {
      personalCode = generateLvNewIdCode();
    }
  }

  idCodeElement.value = personalCode;

  validateIdCode(personalCode);
});

idCodeElement.addEventListener("input", () => {
  validateIdCode();
});

dateOfBirthElement.addEventListener("change", () => {
  ageElement.value = "";
});

ageElement.addEventListener("change", () => {
  dateOfBirthElement.value = "";
});

function validateIdCode() {
  const idCode = idCodeElement.value.trim();
  if (!idCode) {
    idCodeElement.classList.remove("valid", "invalid");
  }
  let isValid = isValidIdCode(idCode);

  idCodeElement.classList.toggle("valid", isValid);
  idCodeElement.classList.toggle("invalid", !isValid);
}

function generateEeLtIdCode() {
  const country = EE_LT;
  const dateOfBirth = getDateOfBirth(country);
  const gender = getGender();
  const genderCode = getGenderCode(gender, dateOfBirth);
  const birthOrderNumber = getRandomBirthOrderNumber();
  const birthOrderNumberWithLeadingZeros = getNumberWithLeadingZeros(birthOrderNumber, 3);
  const idCodeWithoutChecksum = genderCode + formatDateOfBirth(dateOfBirth, country) + birthOrderNumberWithLeadingZeros;
  return idCodeWithoutChecksum + getChecksumForEeLt(idCodeWithoutChecksum);
}

function generateLvOldIdCode() {
  const country = LV_OLD;
  const dateOfBirth = getDateOfBirth(country);
  const centuryCode = getCenturyCode(dateOfBirth.getFullYear());
  let birthOrderNumber = getRandomBirthOrderNumber();
  let birthOrderNumberWithLeadingZeros = getNumberWithLeadingZeros(birthOrderNumber, 3);
  let idCodeWithoutChecksum = formatDateOfBirth(dateOfBirth, country) + "-" + centuryCode + birthOrderNumberWithLeadingZeros;
  let checksum = getChecksumForLv(idCodeWithoutChecksum);
  while (checksum === 10) {
    birthOrderNumber += 1;
    if (birthOrderNumber > 999) {
      birthOrderNumber = 1;
    }
    birthOrderNumberWithLeadingZeros = getNumberWithLeadingZeros(birthOrderNumber, 3);
    idCodeWithoutChecksum = formatDateOfBirth(dateOfBirth, country) + "-" + centuryCode + birthOrderNumberWithLeadingZeros;
    checksum = getChecksumForLv(idCodeWithoutChecksum);
  }
  return idCodeWithoutChecksum + checksum;
}

function generateLvNewIdCode() {
  const newCodeIdentifier = "3";
  let secondDigit = "2";
  if (secondLvDigitElement && secondLvDigitElement.value) {
    const digit = parseInt(secondLvDigitElement.value, 10);
    if (digit >= 2 && digit <= 9) {
      secondDigit = digit.toString();
    }
  }
  const eightRandomDigits = getNumberWithLeadingZeros(Math.floor(Math.random() * 99999999), 8);
  let idCodeWithoutChecksum = newCodeIdentifier + secondDigit + eightRandomDigits;
  let checksum = getChecksumForLv(idCodeWithoutChecksum);
  while (checksum === 10) {
    const randomDigits = getNumberWithLeadingZeros(Math.floor(Math.random() * 99999999), 8);
    idCodeWithoutChecksum = newCodeIdentifier + secondDigit + randomDigits;
    checksum = getChecksumForLv(idCodeWithoutChecksum);
  }
  const idCode = idCodeWithoutChecksum + checksum;
  return idCode.slice(0, 6) + "-" + idCode.slice(6);
}

function getGender() {
  const genderElement = document.getElementById("gender");
  if (genderElement && genderElement.value) {
    return genderElement.value;
  }
  return getRandomGender();
}

function getChecksumForEeLt(idCodeWithoutChecksum) {
  const weights1 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 1];
  const weights2 = [3, 4, 5, 6, 7, 8, 9, 1, 2, 3];

  let sum1 = 0;
  let sum2 = 0;

  for (let i = 0; i < idCodeWithoutChecksum.length; i++) {
    const digit = parseInt(idCodeWithoutChecksum[i], 10);
    sum1 += digit * weights1[i];
    sum2 += digit * weights2[i];
  }

  const remainder1 = sum1 % 11;
  if (remainder1 < 10) {
    return remainder1;
  }

  const remainder2 = sum2 % 11;
  return remainder2 < 10 ? remainder2 : 0;
}

function getChecksumForLv(idCodeWithoutChecksum) {
  idCodeWithoutChecksum = idCodeWithoutChecksum.replace("-", "");
  const weights = [1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
  let sum = 0;

  for (let i = 0; i < idCodeWithoutChecksum.length; i++) {
    const digit = parseInt(idCodeWithoutChecksum[i], 10);
    sum += digit * weights[i];
  }

  return (1101 - sum) % 11;
}

function getGenderCode(gender, dateOfBirth) {
  const isMale = gender === "MALE";
  const year = dateOfBirth.getFullYear();
  if (year >= 1800 && year <= 1899) {
    return isMale ? "1" : "2";
  } else if (year >= 1900 && year <= 1999) {
    return isMale ? "3" : "4";
  } else if (year >= 2000 && year <= 2099) {
    return isMale ? "5" : "6";
  }
  return null;
}

function getRandomGender() {
  return Math.random() < 0.5 ? "MALE" : "FEMALE";
}

function getDateOfBirth(country) {
  if (dateOfBirthElement && dateOfBirthElement.value) {
    return new Date(dateOfBirthElement.value);
  }
  if (ageElement && ageElement.value) {
    return getDateByAge(parseInt(ageElement.value));
  }
  return getRandomDate(country);
}

function getRandomDate(country) {
  const minDate = new Date(MIN_DATE);
  let maxDate = new Date();
  if (country === EE_LT && !maxDateAsTodayElement.checked) {
    maxDate = new Date(MAX_DATE_IN_EE_LT);
  } else if (country === LV_OLD) {
    maxDate = new Date(MAX_DATE_IN_LV_OLD);
  }
  const minTime = minDate.getTime();
  const maxTime = maxDate.getTime();
  const randomTime = Math.random() * (maxTime - minTime) + minTime;
  return new Date(randomTime);
}

function getDateByAge(age) {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const currentDate = today.getDate();
  const minDate = new Date(MIN_DATE);

  const latest = new Date(
    currentYear - age,
    currentMonth,
    currentDate
  );

  let earliest = new Date(
    currentYear - age - 1,
    currentMonth,
    currentDate + 1
  );

  if (earliest < minDate) {
    earliest = minDate;
  }

  if (earliest > latest) {
    return minDate;
  }

  const randomTime = earliest.getTime() + Math.random() * (latest.getTime() - earliest.getTime());

  return new Date(randomTime);
}

function getCenturyCode(year) {
  if (year >= 1800 && year <= 1899) {
    return 0;
  } else if (year >= 1900 && year <= 1999) {
    return 1;
  }
  return 2;
}

function formatDateOfBirth(dateOfBirth, country) {
  const year = dateOfBirth.getFullYear().toString().slice(-2);
  const month = String(dateOfBirth.getMonth() + 1).padStart(2, '0');
  const day = String(dateOfBirth.getDate()).padStart(2, '0');
  if (country === LV_OLD) {
    return `${day}${month}${year}`;
  }
  return `${year}${month}${day}`;
}

function getRandomBirthOrderNumber() {
  return Math.floor(Math.random() * 999) + 1;
}

function getNumberWithLeadingZeros(number, totalLength) {
  return String(number).padStart(totalLength, '0');
}

function isValidIdCode(idCode) {
  const country = countryElement.value;
  if (country === EE_LT && idCode.length === 11) {
    return isValidEeLtIdCode(idCode);
  } else if (country === LV_OLD && idCode.length === 12) {
    return isValidLvOldIdCode(idCode);
  } else if (country === LV_NEW && idCode.length === 12) {
    return isValidLvNewIdCode(idCode);
  }
  return false;
}

function isValidEeLtIdCode(idCode) {
  if (!EE_LT_REGEX.test(idCode)) {
    return false;
  }
  const idCodeWithoutCheckSum = idCode.slice(0, -1);
  const checksum = parseInt(idCode.slice(-1));
  return checksum === getChecksumForEeLt(idCodeWithoutCheckSum);
}

function isValidLvOldIdCode(idCode) {
  if (!LV_OLD_REGEX.test(idCode)) {
    return false;
  }
  const idCodeWithoutCheckSum = idCode.replace("-", "").slice(0, -1);
  const checksum = parseInt(idCode.slice(-1));
  return checksum === getChecksumForLv(idCodeWithoutCheckSum);
}

function isValidLvNewIdCode(idCode) {
  if (!LV_NEW_REGEX.test(idCode)) {
    return false;
  }
  const idCodeWithoutCheckSum = idCode.replace("-", "").slice(0, -1);
  const checksum = parseInt(idCode.replace("-", "").slice(-1));
  return checksum === getChecksumForLv(idCodeWithoutCheckSum);
}
