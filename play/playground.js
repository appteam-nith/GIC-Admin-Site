var keys = ["Name", "Mobile", "Email", "Branch", "Skills", "Achievements", "Area of Interest", "Ques1", "Ques2", "Ques3", "Ques4"];
var currentUserData={
  
};
for(var key in keys){
  console.log(keys[key]);
  if(!currentUserData.hasOwnProperty(keys[key])) {
    currentUserData[keys[key]] = "";
  }
}
console.log(currentUserData);
