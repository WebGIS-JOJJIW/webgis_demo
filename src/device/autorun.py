import subprocess
import sys
import os

from util_fileMon import Config

processes = []

def terminate_subprocesses():
    for process in processes:
        process.terminate()

# Function to run scripts based on selected mode
def run_scripts_based_on_mode(mode, mode_to_scripts):
    scripts = mode_to_scripts.get(mode)
    
    if not scripts:
        print(f"Error: Invalid mode '{mode}' or mode not defined in config.")
        return
    try:
        # Launch each script as a subprocess
        for script in scripts:
            process = subprocess.Popen(f"python3 {script}", shell=True)
            processes.append(process)
            print(f"\tStarted {script}")
        
        # Wait for all scripts to finish
        for process in processes:
            process.wait()

        print(f"All scripts for mode '{mode}' have finished running.")
    
    except KeyboardInterrupt:
        print(f"\n{os.path.basename(__file__)}: Interrupt autorun by user. Exiting...")

    except Exception as e:
        print(f"Error while running scripts: {e}")
    
    finally:
        # Ensure all subprocesses are terminated
        terminate_subprocesses()

if __name__ == '__main__':
    # Check if a mode argument is passed from the command line
    selected_mode = sys.argv[1] if len(sys.argv) > 1 else None

    # If no argument is passed, load from config
    if not selected_mode:
        appConf = Config()
        config = appConf.load("config/conf_autorun.json")  # Path to configuration file
        
        if not config:
            print("Error: Failed to load configuration.")
            sys.exit(1)
        
        selected_mode = config.get("selectedMode")
        mode_to_scripts = config.get("modeToScripts")

        if not selected_mode or not mode_to_scripts:
            print("Error: 'selectedMode' or 'modeToScripts' not found in the configuration.")
            sys.exit(1)
    else:
        appConf = Config()
        config = appConf.load("config/conf_autorun.json")  # Load the config for mode_to_scripts
        mode_to_scripts = config.get("modeToScripts") if config else {}

    # Run the scripts based on the selected mode
    if selected_mode:
        print(f"Autorun in mode: {selected_mode}")
        run_scripts_based_on_mode(selected_mode, mode_to_scripts)
    else:
        print("Error: No mode specified.")
        sys.exit(1)
