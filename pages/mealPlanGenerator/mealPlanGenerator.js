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

      // Show the 'Please wait...' button and hide the 'SUBMIT' button
      document.getElementById("wait-button").style.display = "block";
      document.getElementById("submit-button").style.display = "none";

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

      const username = localStorage.getItem("user");
      console.log(username);

      // Combining all values to create JSON
      const fullUserInput = {
        username,
        mealChecklist,
        preferences,
      };

      //
      const response = await fetch(
        SERVER_URL,
        makeOptions("POST", fullUserInput, true)
      );

      if (response.ok) {
        const responseData = await response.json();

        var jsonString = responseData.answer;
        var myJsonObject = JSON.parse(jsonString);
        document.getElementById("jsonTable").innerHTML =
        createAccordion(myJsonObject);

        if (myJsonObject.hasOwnProperty('Breakfast')) {
          console.log(myJsonObject['Breakfast']); // Logs the 'Breakfast' object
      }    

        //alert("Answer from OpenAI received");

        document.getElementById("wait-button").style.display = "none";
        document.getElementById("submit-button").style.display = "block";

        return responseData;
      } else {
        document.getElementById("wait-button").style.display = "none";
        document.getElementById("submit-button").style.display = "block";
        const errorData = await response.json();

        document.getElementById("result").innerText =
        "* ERROR *";

        throw new Error(errorData.message);
      }

      
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

  let mealList = []
  
function createAccordion(JSONObject) {
    var accordionId = "accordionExample"; // A unique ID for the accordion
    var accordionHtml = `<div class="accordion" id="${accordionId}">`;
    var itemIndex = 0;

    for (var key in JSONObject) {
        if (JSONObject.hasOwnProperty(key)) {
            var value = JSONObject[key];
            console.log(value.MealType)
            //You're working here
            mealList.push(value);
            printMealListInfo()

            var headingId = `heading${itemIndex}`;
            var collapseId = `collapse${itemIndex}`;

            // Use value.MealType to display the meal type in the accordion button
            var mealType = value.MealType || 'Unknown'; // Fallback to 'Unknown' if MealType is not present

            accordionHtml += `
                <div class="accordion-item">
                    <h2 class="accordion-header" id="${headingId}">
                        <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#${collapseId}" aria-expanded="true" aria-controls="${collapseId}">
                            ${mealType}
                        </button>

                    </h2>
                    <div id="${collapseId}" class="accordion-collapse collapse ${itemIndex === 0 ? 'show' : ''}" aria-labelledby="${headingId}" data-bs-parent="#${accordionId}">
                        <div class="accordion-body">
                            ${typeof value === "object" && value !== null ? createAccordionContent(value) : value}
                        </div>
                    </div>
                </div>`;
            itemIndex++;
        }
    }

    accordionHtml += `</div>`;
    return accordionHtml;
}

function printMealListInfo() {
  console.log("MealList length " + mealList.length);
  for (var meal of mealList) {
    console.log("Meal " + meal.MealType);
  }
}


function createAccordionContent(obj) {
  var content = "<ul style=\"color: black\">";

  // Create button
  //content += "<div class=\"d-grid gap-2 d-md-flex justify-content-md-end\"> <button type=\"button\" id=\"saveBtn\" class=\"btn btn-danger me-md-2\">Show Object Info</button> </div>";
  // content += `<div class="d-grid gap-2 d-md-flex justify-content-md-end"> <button type="button" class="saveBtn btn btn-danger me-md-2">Show Object Info</button> </div>`;
 // content += `<div class="d-grid gap-2 d-md-flex justify-content-md-end"> <button type="button" class="saveBtn btn btn-danger me-md-2">Show Object Info</button> </div>`;
 content += `<div class="d-grid gap-2 d-md-flex justify-content-md-end">
 <button type="button" class="saveBtn btn btn-danger me-md-2" data-meal='${JSON.stringify(obj)}'>Show Object Info</button>
</div>`;

  for (var key in obj) {

      if (obj.hasOwnProperty(key)) {
          var value = obj[key];

          if (Array.isArray(value)) {
              // Handle array elements
              content += `<li>${key}: `;
              value.forEach(function (item, index) {
                  content += `${item}${index < value.length - 1 ? ', ' : ''}`;
              });
              content += "</li>";
          } else if (typeof value === "object" && value !== null) {
              // Recursive call for nested objects
              content += `<li>${key}: ${createAccordionContent(value)}</li>`;
          } else {
              // Handle normal elements
              content += `<li>${key}: ${value}</li>`;
          }

         
          
      }
   
  }


  
  content += "</ul>";



  return content;
}

   //BUTTON WORKS but need to find how to get the meal data exactly. 
   document.body.addEventListener("click", function (event) {
   

    if (event.target.classList.contains("saveBtn")) {
      const mealData = JSON.parse(event.target.getAttribute("data-meal"));
      handleSaveBtnClick(mealData);
    }
  });

/*document.body.addEventListener("click", function (event) {
  if (event.target.classList.contains("saveBtn")) {
      alert("Hello World!");
  }
});*/



function handleSaveBtnClick(obj){
  var check = false

  console.log("Works :)" + obj)
  alert("IT WORKS " + obj.MealType)

}
    
  document
  .getElementById("preference-input")
  .addEventListener("input", addPreference);
  }