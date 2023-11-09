import { API_URL } from "../../settings.js";
import {
  sanitizeStringWithTableRows,
  handleHttpErrors,
  makeOptions,
} from "../../utils.js";

const SERVER_URL = API_URL + "/mealPlanGenerator";

export async function initMealPlanGenerator() {
  document
    .getElementById("submit-button")
    .addEventListener("click", async function (event) {
      event.preventDefault(); // Prevent the default form submission

      // user info
      const sex = document.getElementById("sex").value;
      const age = document.getElementById("age").value;
      const weight = document.getElementById("weight").value;
      const activityLevel = document.getElementById("activity-level").value;

      // Goals
      const goals = document.getElementById("goalsText").value;

      // preferences
      let preferences = [];
      const preferenceContainer = document.getElementById("input-container");
      const preferencesInputs =
        preferenceContainer.querySelectorAll('input[type="text"]');
      preferencesInputs.forEach((p) => {
        if (p.value.trim().length > 0) {
          preferences.push(p.value);
        }
      });

      // meal checklist
      const mealChecklistDiv = document.getElementById("mealChecklistDiv");
      // itererer igennem checkboxene og lægger dem til selectedMeals hvis de er checked

      var checkboxesList = mealChecklistDiv.querySelectorAll(
        'input[type="checkbox"]'
      );
      let mealChecklist = [];
      checkboxesList.forEach((mealType) => {
        if (mealType.checked) {
          mealChecklist.push(mealType.value);
        }
      });

      //Amount of days
      const amountOfDays = document.getElementById("select-days").value;

      // Combining all values to create JSON
      const fullUserInput = {
        age,
        sex,
        weight,
        activityLevel,
        mealChecklist,
        preferences,
        goals,
        amountOfDays
      };

      //
      const response = await fetch(
        SERVER_URL,
        makeOptions("POST", fullUserInput, true)
      );

      if (response.ok) {
        const responseData = await response.json();

        document.getElementById("result").innerText = responseData.answer;
        alert("Answer from OpenAI received");
        return responseData;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }

      //const spinner = document.getElementById('spinner1');

      /*try {
    spinner.style.display = "block";
    const response = await fetch(URL).then(handleHttpErrors);
    document.getElementById('result').innerText = response.answer;
    //document.getElementById('about').value = '';
  } catch (e) {
    result.style.color = "red";
    result.innerText = e.message;
  } finally {
    spinner.style.display = "none";
  }*/
    });
  function addPreference(event) {
    if (event.target.value.length === 1) {
      const inputContainer = document.getElementById("input-container");
      const newInput = document.createElement("input");
      newInput.type = "text";
      newInput.placeholder = "Enter a preference/allergy";
      inputContainer.appendChild(newInput);
      newInput.addEventListener("input", addPreference);
    }
  }

  document
    .getElementById("preference-input")
    .addEventListener("input", addPreference);
}
