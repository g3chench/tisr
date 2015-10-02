## Inspired by an episode of MinutePhysics
# You can find a link to the original video here: https://www.youtube.com/watch?v=eivGlBKlK6M
# The algorithm used here is from https://www.youtube.com/watch?v=C5-I0bAuEUE
# but you should really watch the first one first

import sys
from random import shuffle
class Box:
    def __init__(self, bill):
        self.bill = bill
    def get_human_bill(self): # for human readibility; not strictly needed
        return self.bill + 1
    def get_bill(self):
        return self.bill

boxes = []
people = [x for x in range(100)]

def setup():
    global people
    global boxes

    shuffle(people)
    boxes = []

    for i in people:
        boxes.append(Box(i))

def do_experiment():
    fail = False
    for person in people:
        fail = True
        print("Hello I'm persion number", person + 1)
        next_index = person
        for i in range(50):
            print("Now looking in box", next_index+1)
            box = boxes[next_index]
            print("Found bill number", box.get_human_bill())
            if box.get_bill() == person:
                print("Success!")
                print("My chain length has been", i+1, file=sys.stderr)
                fail = False
                break
            else:
                next_index = box.get_bill()
        if fail:
            print("Experiment Failed. I just made $100!", file=sys.stderr)
            break
    if not fail:
        print("You have all succeeded! Here's $101 for all of you.", file=sys.stderr)
        return True
    else:
        return False


if __name__ == "__main__":
    computer_score = 0
    user_score = 0
    success = 0
    plays = 0
    limit = -1
    if len(sys.argv) == 3 and sys.argv[1] == "-t":
        limit = int(sys.argv[2])
    not_done = True
    while not_done:
        print("The score is now:", file=sys.stderr)
        print("Computer:", computer_score, file=sys.stderr)
        print("You: ", user_score, file=sys.stderr)
        print("Plays:", plays, file=sys.stderr)
        try:
            print("Success rate:", success/plays, file=sys.stderr)
        except ZeroDivisionError:
            print("Success rate: N/A", file=sys.stderr)

        if(limit > 0 and limit < plays):
            break
        if not (len(sys.argv) == 3 and sys.argv[1] == "-t"):
            input("Press enter to start")

        setup()
        if do_experiment():
            computer_score -= 101
            user_score += 101
            success += 1
        else:
            computer_score += 100
            user_score -= 1

        plays += 1

        #not_done = "" #uncomment if you want it to ask if you want to play again
        while isinstance(not_done, str):
            not_done = input("Would you like to play again?[Y/n]: ")

            if not_done == "" or not_done == "Y" or not_done == "y":
                not_done = True
            elif not_done == "n" or not_done == "N":
                not_done = False
            else:
                continue