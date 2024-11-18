class GreetingRequest {
    constructor(timeOfDay, language, tone) {
        this.timeOfDay = timeOfDay;
        this.language = language;
        this.tone = tone;
      }
}

//Took me way longer than I'm proud of to realize I needed this line
module.exports = GreetingRequest;