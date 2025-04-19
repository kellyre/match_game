import tkinter as tk
from tkinter import messagebox
import random
import time
import string

class MatchingGame:
    def __init__(self, root):
        self.root = root
        self.root.title("Matching Game")
        self.root.resizable(True, True)  # Allow window resizing
        
        self.game_frame = None
        self.buttons = []
        self.first_click = None
        self.matches_found = 0
        self.attempts = 0
        self.start_time = None
        self.game_active = False
        self.pending_hide_id = None  # Store the after() ID for cancellation
        self.buttons_to_hide = None  # Store the buttons to hide when a match fails
        
        # Available colors for characters
        self.colors = ["red", "blue", "green", "purple", "orange", "cyan", "magenta", "brown"]
        
        # Show game size selection screen
        self.show_size_selection()
    
    def show_size_selection(self):
        # Clear any existing frames
        if self.game_frame:
            self.game_frame.destroy()
        
        # Create selection frame
        self.selection_frame = tk.Frame(self.root, padx=20, pady=20)
        self.selection_frame.pack(fill=tk.BOTH, expand=True)
        
        # Title
        tk.Label(self.selection_frame, text="Matching Game", font=("Arial", 18, "bold")).pack(pady=10)
        tk.Label(self.selection_frame, text="Select Grid Size:", font=("Arial", 12)).pack(pady=10)
        
        # Grid size buttons
        sizes = ["4x4", "6x6", "8x8"]
        for size in sizes:
            btn = tk.Button(self.selection_frame, text=size, width=10, height=2,
                           command=lambda s=size: self.start_game(int(s[0])))
            btn.pack(pady=5)
        
        # Exit button
        tk.Button(self.selection_frame, text="Exit", width=10, height=2,
                 command=self.root.destroy).pack(pady=10)
    
    def start_game(self, grid_size):
        self.selection_frame.destroy()
        
        # Create game frame with grid configuration
        self.game_frame = tk.Frame(self.root)
        self.game_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        # Configure rows and columns to be resizable
        for i in range(grid_size):
            self.game_frame.grid_rowconfigure(i, weight=1)
            self.game_frame.grid_columnconfigure(i, weight=1)
        
        # Reset game variables
        self.buttons = []
        self.first_click = None
        self.matches_found = 0
        self.attempts = 0
        self.start_time = None
        self.game_active = True
        
        # Create pairs of characters with colors
        num_pairs = (grid_size * grid_size) // 2
        characters = list(string.ascii_uppercase + string.digits)
        random.shuffle(characters)
        characters = characters[:num_pairs]
        
        # Create pairs with random colors
        pairs = []
        for char in characters:
            color = random.choice(self.colors)
            pairs.extend([(char, color), (char, color)])
        
        # Shuffle the pairs
        random.shuffle(pairs)
        
        # Create the grid of buttons
        for row in range(grid_size):
            button_row = []
            for col in range(grid_size):
                idx = row * grid_size + col
                char, color = pairs[idx]
                
                btn = tk.Button(self.game_frame, text="", font=("Arial", 12, "bold"),
                               command=lambda r=row, c=col: self.on_button_click(r, c))
                btn.grid(row=row, column=col, padx=2, pady=2, sticky="nsew")
                
                # Store button and its hidden character/color
                button_row.append({
                    "button": btn,
                    "char": char,
                    "color": color,
                    "revealed": False
                })
            self.buttons.append(button_row)
    
    def on_button_click(self, row, col):
        # Start timer on first click of the game
        if not self.start_time and self.game_active:
            self.start_time = time.time()
        
        # Ignore clicks on already revealed buttons
        if self.buttons[row][col]["revealed"]:
            return
        
        # If there's a pending hide operation and user clicks a new button
        if not self.game_active and self.pending_hide_id is not None:
            # Cancel the scheduled hide operation
            self.root.after_cancel(self.pending_hide_id)
            self.pending_hide_id = None
            
            # Hide the previously non-matching buttons
            prev_row1, prev_col1, prev_row2, prev_col2 = self.buttons_to_hide
            self.hide_buttons(prev_row1, prev_col1, prev_row2, prev_col2)
            
            # Reset first click to None so this new click becomes the first of a new pair
            self.first_click = None
            self.game_active = True
        
        # Ignore clicks when game is not active (other scenarios)
        if not self.game_active:
            return
        
        # Reveal the clicked button
        btn_info = self.buttons[row][col]
        btn = btn_info["button"]
        btn.config(text=btn_info["char"], fg=btn_info["color"], bg="white")
        
        # If this is the first button clicked
        if self.first_click is None:
            self.first_click = (row, col)
        else:
            # This is the second button clicked
            self.attempts += 1
            first_row, first_col = self.first_click
            first_btn_info = self.buttons[first_row][first_col]
            
            # Check if the two buttons match
            if (btn_info["char"] == first_btn_info["char"] and 
                btn_info["color"] == first_btn_info["color"]):
                # Match found
                btn_info["revealed"] = True
                first_btn_info["revealed"] = True
                self.matches_found += 1
                
                # Check if all matches are found
                if self.matches_found == (len(self.buttons) * len(self.buttons[0])) // 2:
                    self.game_active = False
                    self.show_game_over()
            else:
                # No match, hide after delay
                self.game_active = False
                self.buttons_to_hide = (row, col, first_row, first_col)
                self.pending_hide_id = self.root.after(
                    2000, 
                    lambda: self.hide_buttons(row, col, first_row, first_col)
                )
            
            # Reset first click
            self.first_click = None
    
    def hide_buttons(self, row1, col1, row2, col2):
        # Hide the two non-matching buttons
        self.buttons[row1][col1]["button"].config(text="", bg="SystemButtonFace")
        self.buttons[row2][col2]["button"].config(text="", bg="SystemButtonFace")
        self.game_active = True
        self.pending_hide_id = None  # Reset the pending hide ID
    
    def show_game_over(self):
        elapsed_time = time.time() - self.start_time
        minutes = int(elapsed_time // 60)
        seconds = int(elapsed_time % 60)
        
        message = f"Congratulations!\n\n" \
                 f"You completed the game in {minutes}m {seconds}s\n" \
                 f"Number of attempts: {self.attempts}"
        
        messagebox.showinfo("Game Over", message)
        self.show_size_selection()

if __name__ == "__main__":
    root = tk.Tk()
    game = MatchingGame(root)
    root.mainloop()





