import { db } from './db.js';
import { courses, lessons, achievements } from '@shared/schema';
import { sql } from 'drizzle-orm';

async function seed() {
  try {
    console.log('🌱 Starting database seed...\n');

    console.log('🗑️  Clearing existing data...');
    await db.execute(sql`DELETE FROM user_achievements`);
    await db.execute(sql`DELETE FROM user_progress`);
    await db.execute(sql`DELETE FROM enrollments`);
    await db.execute(sql`DELETE FROM lessons`);
    await db.execute(sql`DELETE FROM courses`);
    await db.execute(sql`DELETE FROM achievements`);
    console.log('✅ Existing data cleared\n');

    console.log('📚 Creating courses...');
    const [course1, course2, course3] = await db.insert(courses).values([
      {
        title: 'PC Troubleshooting Fundamentals',
        description: 'Master the basics of diagnosing and fixing common computer hardware issues',
        category: 'Hardware Headaches',
        difficulty: 'Beginner',
        xpTotal: 500,
      },
      {
        title: 'Network Troubleshooting Essentials',
        description: 'Learn to diagnose and resolve common network connectivity problems',
        category: 'Network Nightmares',
        difficulty: 'Intermediate',
        xpTotal: 750,
      },
      {
        title: 'Operating System Troubleshooting 101',
        description: 'Solve common Windows and software-related issues with confidence',
        category: 'Software Struggles',
        difficulty: 'Beginner',
        xpTotal: 500,
      },
    ]).returning();
    console.log(`✅ Created 3 courses\n`);

    console.log('📖 Creating lessons...');
    
    const course1Lessons = await db.insert(lessons).values([
      {
        courseId: course1.id,
        title: 'Understanding POST Beep Codes',
        description: 'Learn to diagnose hardware failures using Power-On Self-Test beep codes',
        orderIndex: 0,
        xpReward: 100,
        content: {
          problem: "A customer brings in a desktop PC that won't boot. When powered on, you hear three short beeps followed by a pause, then the pattern repeats. The monitor remains black and shows no signal.",
          steps: [
            "Listen carefully to the beep pattern and count the beeps",
            "Reference the motherboard manufacturer's beep code documentation (check the manual or manufacturer website)",
            "For this pattern (3 short beeps), it typically indicates a memory (RAM) failure",
            "Power off the computer and unplug it from the wall",
            "Open the case and locate the RAM modules",
            "Remove all RAM modules and inspect for physical damage or corrosion",
            "Reseat the RAM firmly in their slots, ensuring they click into place",
            "If multiple modules exist, test with one module at a time in different slots",
            "Power on and check if the beep pattern changes or system boots"
          ],
          solution: "The three short beeps indicated a RAM failure. After reseating the memory modules, the system successfully completed POST and booted normally. The issue was caused by a loose connection in one of the RAM slots. Always ensure RAM modules are fully seated with both retention clips engaged."
        }
      },
      {
        courseId: course1.id,
        title: 'RAM Troubleshooting and Testing',
        description: 'Diagnose and resolve memory-related issues in desktop and laptop computers',
        orderIndex: 1,
        xpReward: 100,
        content: {
          problem: "A user reports their computer has become extremely slow and occasionally displays blue screen errors mentioning 'MEMORY_MANAGEMENT'. The system sometimes freezes during startup or while running applications.",
          steps: [
            "Boot into Windows and check Event Viewer for memory-related errors",
            "Run Windows Memory Diagnostic tool (search 'Windows Memory Diagnostic' in Start menu)",
            "Select 'Restart now and check for problems' to run the test",
            "Allow the test to complete (this may take 15-20 minutes)",
            "Review the test results after the system restarts",
            "If errors are found, run MemTest86 from a USB drive for more thorough testing",
            "Test each RAM module individually to isolate the faulty module",
            "Try the suspected module in different slots to rule out slot issues",
            "Check RAM compatibility with the motherboard specifications"
          ],
          solution: "The Windows Memory Diagnostic revealed memory errors. After testing each RAM module individually with MemTest86, one 8GB module showed consistent errors across multiple passes. Replacing the faulty module resolved the blue screens and performance issues. The user was advised to always buy RAM in matched pairs and verify compatibility before purchase."
        }
      },
      {
        courseId: course1.id,
        title: 'Power Supply Diagnostics',
        description: 'Identify and troubleshoot power supply failures and issues',
        orderIndex: 2,
        xpReward: 100,
        content: {
          problem: "A desktop computer intermittently shuts down without warning, especially when running demanding applications or games. Sometimes it won't power on at all, but after waiting 10-15 minutes, it starts normally. The user hears a clicking sound from inside the case.",
          steps: [
            "Check if the power supply fan is spinning when the system is on",
            "Listen for unusual noises (clicking, buzzing, or whining) from the PSU",
            "Use a multimeter to test the power outlet voltage (should be ~120V in US, ~230V in EU)",
            "Check all power connections are firmly seated (24-pin motherboard, 4/8-pin CPU, PCIe power)",
            "Verify the PSU wattage is sufficient for all components (use online PSU calculator)",
            "Perform a paperclip test: disconnect PSU from all components, bridge green and black wires on 24-pin connector with paperclip",
            "If PSU fan spins during paperclip test, use a multimeter to check voltage rails (+3.3V, +5V, +12V)",
            "Check for bulging or leaking capacitors visible through PSU vent holes",
            "Monitor system temperatures with HWMonitor or similar software"
          ],
          solution: "The clicking sound and intermittent shutdowns indicated a failing power supply. Testing with a multimeter revealed the +12V rail was dropping to 11.2V under load, below the acceptable range. The 500W PSU was also undersized for the system's GTX 1080 Ti which requires a quality 600W+ PSU. Replacing with a reliable 650W 80+ Bronze PSU resolved all issues. Important lesson: Always account for power spikes and choose quality PSUs with adequate wattage headroom."
        }
      },
      {
        courseId: course1.id,
        title: 'Hard Drive Diagnostics and Recovery',
        description: 'Diagnose failing storage devices and recover data when possible',
        orderIndex: 3,
        xpReward: 100,
        content: {
          problem: "A user's laptop is extremely slow, taking 5+ minutes to boot. They hear clicking sounds from the laptop, and files randomly disappear or become corrupted. Windows shows frequent 'disk read error' messages.",
          steps: [
            "Boot into BIOS and check if the hard drive is detected",
            "Listen for clicking, grinding, or beeping sounds from the drive (signs of mechanical failure)",
            "Boot from a Windows installation USB or Linux live USB to test if Windows is the issue",
            "Use CrystalDiskInfo to check the drive's S.M.A.R.T. status",
            "Look for warning signs: reallocated sectors, pending sectors, uncorrectable errors",
            "Run CHKDSK /F /R from Command Prompt (as Administrator) to attempt repair",
            "If CHKDSK fails or takes excessive time, immediately backup critical data",
            "Use disk cloning software (Macrium Reflect, Clonezilla) to clone to a new drive",
            "Check drive connections and cables if it's a desktop (try different SATA port/cable)"
          ],
          solution: "The clicking sound was the 'click of death' - a clear sign of mechanical hard drive failure. S.M.A.R.T. data showed over 200 reallocated sectors and pending sector count increasing. We immediately stopped using the drive and successfully cloned 95% of the data to a new SSD using ddrescue in Linux. The old drive was replaced with a 500GB SSD, dramatically improving performance. The user was educated about the importance of regular backups using the 3-2-1 backup strategy."
        }
      },
      {
        courseId: course1.id,
        title: 'Peripheral Connectivity Issues',
        description: 'Troubleshoot USB, display, and external device connection problems',
        orderIndex: 4,
        xpReward: 100,
        content: {
          problem: "A user reports that their USB mouse and keyboard work in BIOS but stop responding once Windows loads. External USB drives aren't recognized at all, and the 'USB Device Not Recognized' error appears frequently in Windows.",
          steps: [
            "Check if devices work in different USB ports (front vs back, USB 2.0 vs 3.0)",
            "Test the devices on another computer to rule out device failure",
            "Boot into Safe Mode to check if a driver or software conflict exists",
            "Open Device Manager and look for yellow exclamation marks under 'Universal Serial Bus controllers'",
            "Uninstall all USB Root Hub and USB Host Controller entries in Device Manager",
            "Restart the computer to allow Windows to reinstall USB drivers",
            "Check Windows Update for chipset and USB driver updates",
            "Disable USB Selective Suspend in Power Options advanced settings",
            "Test if Fast Startup is causing issues (disable in Power Options)",
            "Check BIOS settings for USB Legacy Support and XHCI Hand-off options"
          ],
          solution: "The issue was caused by corrupted USB drivers after a Windows update. Uninstalling all USB controllers in Device Manager and restarting allowed Windows to reinstall clean drivers, resolving the issue. Additionally, USB Selective Suspend was causing intermittent disconnections for the mouse. Disabling this power-saving feature and updating the chipset drivers from the motherboard manufacturer's website ensured stable USB connectivity. The user was advised to avoid using USB hubs without external power for high-power devices."
        }
      }
    ]).returning();
    console.log(`✅ Created ${course1Lessons.length} lessons for "${course1.title}"`);

    const course2Lessons = await db.insert(lessons).values([
      {
        courseId: course2.id,
        title: 'IP Configuration and DHCP Issues',
        description: 'Resolve IP addressing problems and DHCP failures',
        orderIndex: 0,
        xpReward: 150,
        content: {
          problem: "An office worker cannot access the internet or network resources. Their computer shows 'Limited connectivity' and has been assigned an IP address starting with 169.254.x.x. Other users on the same network are working fine.",
          steps: [
            "Open Command Prompt and run 'ipconfig /all' to check current IP configuration",
            "Note that 169.254.x.x is an APIPA address, indicating DHCP failure",
            "Check if the network cable is properly connected (look for link lights on NIC)",
            "Try a different network cable and port on the switch",
            "Run 'ipconfig /release' followed by 'ipconfig /renew' to request a new IP",
            "If renewal fails, restart the DHCP Client service: 'net stop dhcp' then 'net start dhcp'",
            "Check if a static IP was accidentally configured: Network Adapter Properties > IPv4 Properties",
            "Verify the computer can reach the default gateway: 'ping [gateway IP]'",
            "Temporarily disable Windows Firewall to rule out blocking DHCP",
            "Check the DHCP server has available addresses in its pool"
          ],
          solution: "The network cable was damaged, causing intermittent connectivity. This prevented the computer from receiving DHCP offers from the server. After replacing the cable and running 'ipconfig /renew', the computer successfully obtained a valid IP address (192.168.1.105) with proper gateway and DNS settings. Network connectivity was fully restored. The user was shown how to identify bad cables by checking for kinks, cuts, or broken clips."
        }
      },
      {
        courseId: course2.id,
        title: 'DNS Resolution Problems',
        description: 'Diagnose and fix Domain Name System resolution failures',
        orderIndex: 1,
        xpReward: 150,
        content: {
          problem: "A user can browse websites using IP addresses (like 8.8.8.8) but cannot access any sites by domain name (like google.com). Browser shows 'DNS_PROBE_FINISHED_NXDOMAIN' or 'Server not found' errors.",
          steps: [
            "Verify the issue: Try to ping a website by name 'ping google.com'",
            "Check if pinging by IP works: 'ping 8.8.8.8'",
            "Display current DNS servers: 'ipconfig /all' and note DNS Server entries",
            "Flush the DNS cache: 'ipconfig /flushdns'",
            "Clear browser DNS cache (Chrome: chrome://net-internals/#dns then 'Clear host cache')",
            "Try using public DNS servers: Set DNS to 8.8.8.8 (Google) and 8.8.4.4",
            "Use nslookup to test DNS resolution: 'nslookup google.com'",
            "Check the hosts file for incorrect entries: C:\\Windows\\System32\\drivers\\etc\\hosts",
            "Disable and re-enable the network adapter",
            "Restart the DNS Client service or the entire router"
          ],
          solution: "The ISP's DNS servers were experiencing an outage. By changing the computer's DNS settings to use Google's public DNS (8.8.8.8 and 8.8.4.4), the user immediately regained the ability to browse websites by domain name. As a permanent fix, we configured the router to use reliable public DNS servers so all network devices would benefit. The user was educated about DNS and why keeping Google or Cloudflare DNS as a backup is helpful."
        }
      },
      {
        courseId: course2.id,
        title: 'Wi-Fi Connectivity Troubleshooting',
        description: 'Fix wireless network connection issues and weak signals',
        orderIndex: 2,
        xpReward: 150,
        content: {
          problem: "A laptop connects to Wi-Fi but the internet is extremely slow or drops connection frequently. The Wi-Fi icon shows full bars but websites take forever to load or time out. Other devices on the same network work perfectly.",
          steps: [
            "Check Wi-Fi signal strength: Look at the connection properties for signal quality",
            "Verify which Wi-Fi band is being used (2.4GHz vs 5GHz)",
            "Run 'ping -t [router IP]' to monitor for packet loss and latency spikes",
            "Check for interference: Move away from microwaves, cordless phones, baby monitors",
            "Scan for nearby networks using a Wi-Fi analyzer app to check for channel congestion",
            "Update the wireless network adapter driver from manufacturer's website",
            "Disable power management for the Wi-Fi adapter in Device Manager",
            "Forget and reconnect to the Wi-Fi network",
            "Change the router's Wi-Fi channel to a less congested one (1, 6, or 11 for 2.4GHz)",
            "Test with 5GHz band if available (less interference but shorter range)"
          ],
          solution: "The laptop's Wi-Fi adapter had an outdated driver and was set to aggressive power saving mode. After updating to the latest driver from Intel's website and disabling 'Allow the computer to turn off this device to save power' in Device Manager, performance improved significantly. Additionally, the router was on channel 6 with 12 other nearby networks. Switching to channel 1 reduced interference. The connection became stable with consistent speeds. The user learned to position the laptop with clear line-of-sight to the router when possible."
        }
      },
      {
        courseId: course2.id,
        title: 'Router Configuration and Port Forwarding',
        description: 'Configure routers and troubleshoot port forwarding for applications',
        orderIndex: 3,
        xpReward: 150,
        content: {
          problem: "A user is trying to host a Minecraft server for friends but players outside their home network cannot connect. The user has set up the server software correctly and it works locally, but external connections timeout. They need to configure port forwarding.",
          steps: [
            "Identify the router's IP address (usually 192.168.1.1 or 192.168.0.1)",
            "Log into the router's admin panel via web browser",
            "Find the server computer's local IP address using 'ipconfig'",
            "Assign a static IP or DHCP reservation for the server computer",
            "Locate Port Forwarding settings (may be under Advanced, NAT, or Virtual Servers)",
            "Create a new port forwarding rule for Minecraft (default port 25565)",
            "Set External Port: 25565, Internal Port: 25565, Protocol: TCP/UDP",
            "Point the rule to the server computer's local IP address",
            "Find your public IP address using whatismyip.com or similar",
            "Test external connectivity using canyouseeme.org port checker",
            "If still failing, check for double NAT (modem also routing) or ISP port blocking"
          ],
          solution: "After logging into the router, we created a DHCP reservation to give the server PC a permanent local IP (192.168.1.100). We then configured port forwarding to direct external traffic on port 25565 to that internal IP. The router's firewall had 'Block WAN traffic' enabled, which we disabled specifically for this port. The user's public IP was 203.0.113.45, which friends could now use to connect successfully. Important note: We set up Dynamic DNS (using No-IP) because the user's ISP uses dynamic public IPs that change periodically."
        }
      },
      {
        courseId: course2.id,
        title: 'Network Performance and Speed Issues',
        description: 'Diagnose slow network speeds and optimize performance',
        orderIndex: 4,
        xpReward: 150,
        content: {
          problem: "An office is experiencing extremely slow network speeds. Users report that file transfers to the server take ages, video calls are choppy, and web browsing is sluggish. The business pays for 500 Mbps internet but speed tests show only 30-40 Mbps.",
          steps: [
            "Run speed tests from multiple devices using speedtest.net or fast.com",
            "Test wired vs wireless to identify if Wi-Fi is the bottleneck",
            "Check for network congestion: Look at router admin panel for connected devices",
            "Identify bandwidth hogs: Use router QoS page or Wireshark to monitor traffic",
            "Verify all Ethernet cables are Cat5e or better (Cat6 for gigabit)",
            "Check if router/modem needs restart (uptime in admin panel)",
            "Ensure router firmware is up to date",
            "Test direct connection: Bypass router and connect PC directly to modem",
            "Scan for malware that might be using bandwidth",
            "Check with ISP for line quality issues or throttling",
            "Verify QoS (Quality of Service) settings aren't limiting speeds unnecessarily"
          ],
          solution: "Investigation revealed multiple issues: The main switch was a 10/100 Mbps model (not gigabit), creating a bottleneck. Several Cat5 cables were also limiting speeds. After upgrading to a gigabit switch and replacing old cables with Cat6, local network speeds jumped to 1 Gbps. For internet speeds, the modem had been running for 200+ days without a restart, causing performance degradation. After modem/router restart and ISP line check, internet speeds reached 480 Mbps (normal overhead from the advertised 500). We also configured QoS to prioritize VoIP and video conferencing traffic."
        }
      }
    ]).returning();
    console.log(`✅ Created ${course2Lessons.length} lessons for "${course2.title}"`);

    const course3Lessons = await db.insert(lessons).values([
      {
        courseId: course3.id,
        title: 'Blue Screen Error Diagnosis',
        description: 'Decode and resolve Windows Blue Screen of Death (BSOD) errors',
        orderIndex: 0,
        xpReward: 100,
        content: {
          problem: "A user's computer randomly crashes with a blue screen showing 'DRIVER_IRQL_NOT_LESS_OR_EQUAL' error. The crashes occur most often when gaming or using Photoshop. Sometimes the system automatically restarts before the user can read the error.",
          steps: [
            "Enable mini dump files: System Properties > Advanced > Startup and Recovery > Settings",
            "Disable automatic restart on system failure to see the full BSOD message",
            "Note the error code and any .sys file mentioned (e.g., ntoskrnl.exe, nvlddmkm.sys)",
            "Download and install BlueScreenView to analyze dump files",
            "Open BlueScreenView and check the crash dumps in C:\\Windows\\Minidump",
            "Identify the driver or process causing crashes (shown in red in BlueScreenView)",
            "Update the problematic driver (graphics, network, chipset, etc.)",
            "Run Windows Memory Diagnostic to rule out RAM issues",
            "Check Event Viewer > Windows Logs > System for additional clues",
            "If a specific driver repeats, try rolling back to a previous version"
          ],
          solution: "BlueScreenView revealed that nvlddmkm.sys (NVIDIA display driver) was causing all crashes. The user had recently updated to the latest 'Game Ready' driver. We rolled back to the previous 'Studio' driver version using Device Manager > Display adapters > NVIDIA GPU > Properties > Driver > Roll Back Driver. After rolling back, we used DDU (Display Driver Uninstaller) in Safe Mode to completely remove the problematic driver, then performed a clean install of a stable driver version. The crashes stopped immediately. The lesson: Latest drivers aren't always the most stable - sometimes older versions work better."
        }
      },
      {
        courseId: course3.id,
        title: 'Application Crashes and Freezes',
        description: 'Troubleshoot software crashes, hangs, and not responding errors',
        orderIndex: 1,
        xpReward: 100,
        content: {
          problem: "Microsoft Excel crashes every time a user tries to open a specific workbook. Other Excel files open fine. The error message is 'Excel has stopped working' followed by 'A problem caused the program to stop working correctly.' The workbook contains important financial data.",
          steps: [
            "Try opening Excel in Safe Mode: Hold Ctrl while launching Excel",
            "If it opens in Safe Mode, disable add-ins: File > Options > Add-ins > Manage COM Add-ins",
            "Check if the file is corrupted: Try 'Open and Repair' option in Excel",
            "Attempt to open the file in Excel Online (OneDrive) to isolate if it's a local issue",
            "Update Microsoft Office to the latest version via File > Account > Update Options",
            "Repair Office installation: Control Panel > Programs > Microsoft Office > Change > Repair",
            "Check Event Viewer > Application logs for detailed error information",
            "Create a new Excel file and try linking to the problematic workbook externally",
            "Disable hardware acceleration: File > Options > Advanced > Display > Disable hardware graphics acceleration",
            "Check if antivirus is scanning/blocking the file during opening"
          ],
          solution: "The issue was caused by a corrupted third-party Excel add-in for data analysis. Opening Excel in Safe Mode worked because add-ins are disabled. We identified the problematic add-in in COM Add-ins and removed it. The workbook then opened normally. For prevention, we ran Office Repair in 'Online Repair' mode which took 15 minutes but fixed underlying issues. We also recovered a slightly older version from File > Info > Version History as a backup. The user was advised to regularly save important workbooks in multiple formats and locations."
        }
      },
      {
        courseId: course3.id,
        title: 'Driver Updates and Rollbacks',
        description: 'Safely update device drivers and fix driver-related problems',
        orderIndex: 2,
        xpReward: 100,
        content: {
          problem: "After a Windows Update, a user's audio stopped working completely. The sound icon shows a red X with 'No audio output device is installed.' The audio was working perfectly before the update. Device Manager shows the audio device with a yellow exclamation mark.",
          steps: [
            "Open Device Manager (Win+X menu or devmgmt.msc)",
            "Expand 'Sound, video and game controllers' section",
            "Look for devices with yellow exclamation marks or red X marks",
            "Right-click the audio device and select 'Properties' to see the error details",
            "Try 'Update driver' > 'Search automatically for drivers'",
            "If Windows finds nothing, try 'Browse my computer' > 'Let me pick from available drivers'",
            "If the issue started after an update, try 'Roll Back Driver' (if available)",
            "Uninstall the device completely and restart to let Windows reinstall it",
            "Download the latest driver directly from the manufacturer's website",
            "Run Windows Update Troubleshooter: Settings > Update & Security > Troubleshoot"
          ],
          solution: "The Windows Update had automatically installed a generic audio driver that was incompatible with the Realtek audio hardware. We uninstalled the audio device from Device Manager (with 'Delete the driver software' checked) and restarted the computer. Windows automatically reinstalled a working driver. However, for optimal performance, we visited the laptop manufacturer's support page, downloaded the specific Realtek audio driver for that model, and installed it manually. This restored all audio functionality including special features like spatial sound. The user learned to create a System Restore point before major Windows Updates."
        }
      },
      {
        courseId: course3.id,
        title: 'Malware Detection and Removal',
        description: 'Identify, remove, and prevent malware infections',
        orderIndex: 3,
        xpReward: 100,
        content: {
          problem: "A user's computer is behaving strangely: browser homepage changed to an unknown search engine, pop-up ads appear constantly even when no browser is open, computer is very slow, and Windows Defender is disabled and won't turn back on. The user recently downloaded a 'free' video converter.",
          steps: [
            "Boot into Safe Mode with Networking: Hold Shift while clicking Restart > Troubleshoot > Advanced > Startup Settings",
            "Try to enable Windows Defender, if blocked, proceed with third-party tools",
            "Download and run Malwarebytes (free version) in Safe Mode",
            "Perform a full 'Threat Scan' and quarantine all detected items",
            "Download and run AdwCleaner to remove adware and browser hijackers",
            "Reset all browser settings to defaults (Chrome: Settings > Reset settings)",
            "Check browser extensions and remove unfamiliar ones",
            "Check Programs and Features for suspicious recently installed software",
            "Run Autoruns to find programs starting with Windows and disable suspicious entries",
            "Check Task Scheduler for malicious scheduled tasks",
            "Use ESET Online Scanner for a second opinion scan",
            "Change all passwords after cleaning (especially banking and email)"
          ],
          solution: "The 'free video converter' was bundled with multiple PUPs (Potentially Unwanted Programs) and adware. Malwarebytes detected 47 threats including browser hijackers, adware, and a trojan. After quarantine and restart, AdwCleaner found additional registry modifications and scheduled tasks. We removed all detected threats, reset Chrome completely, and uninstalled 5 suspicious programs from the last 2 weeks. We re-enabled Windows Defender and ran a full scan. The computer's performance returned to normal and pop-ups stopped. The user was educated about: only downloading software from official sources, being wary of bundled installers, keeping Windows Defender enabled, and using an ad-blocker for safer browsing."
        }
      },
      {
        courseId: course3.id,
        title: 'System Restore and Recovery',
        description: 'Use System Restore and recovery tools to fix Windows problems',
        orderIndex: 4,
        xpReward: 100,
        content: {
          problem: "After installing a graphics driver update, a user's Windows 10 computer won't boot normally. It shows a black screen with cursor after the Windows logo. Safe Mode works, but the user needs their computer functional for work tomorrow and doesn't want to lose their files.",
          steps: [
            "Boot into Safe Mode (press F8 or Shift+F8 during startup, or use recovery media)",
            "Open System Restore: Type 'rstrui' in Run dialog (Win+R)",
            "Select 'Choose a different restore point' to see all available points",
            "Pick a restore point from before the graphics driver was installed",
            "Review the list of programs that will be affected (shown before confirming)",
            "Confirm and start the restore process (this takes 15-30 minutes)",
            "Let the system restart and complete the restoration",
            "After restore, verify the system boots normally and files are intact",
            "If System Restore wasn't enabled, try booting to recovery environment",
            "Use Startup Repair from Advanced startup options",
            "If all else fails, use 'Reset this PC' keeping personal files"
          ],
          solution: "We successfully booted into Safe Mode and ran System Restore. There was a restore point from 3 days ago, right before the driver update. The restore process took about 20 minutes. After restart, Windows booted normally with the old driver. All user files and programs were intact - System Restore only affects system files and drivers. We then properly updated the graphics driver using DDU first to cleanly remove the old one. To prevent future issues, we enabled System Restore protection on all drives (it was only on C:) and increased the disk space allocation to 5%. The user was taught to manually create restore points before major changes: Control Panel > System > System Protection > Create."
        }
      }
    ]).returning();
    console.log(`✅ Created ${course3Lessons.length} lessons for "${course3.title}"\n`);

    console.log('🏆 Creating achievements...');
    const allAchievements = await db.insert(achievements).values([
      {
        title: 'First Steps',
        description: 'Complete your first lesson',
        iconName: 'Footprints',
        category: 'General',
        xpRequired: 0,
      },
      {
        title: 'Getting Started',
        description: 'Reach Level 2',
        iconName: 'TrendingUp',
        category: 'General',
        xpRequired: 500,
      },
      {
        title: 'Hardware Hero',
        description: 'Complete a Hardware course',
        iconName: 'Cpu',
        category: 'Hardware',
        xpRequired: 1000,
      },
      {
        title: 'Network Ninja',
        description: 'Complete a Network course',
        iconName: 'Network',
        category: 'Network',
        xpRequired: 1500,
      },
      {
        title: 'Software Savior',
        description: 'Complete a Software course',
        iconName: 'Code',
        category: 'Software',
        xpRequired: 1000,
      },
      {
        title: 'Rising Star',
        description: 'Reach Level 5',
        iconName: 'Star',
        category: 'General',
        xpRequired: 2000,
      },
      {
        title: 'Triple Threat',
        description: 'Complete courses from all 3 categories',
        iconName: 'Award',
        category: 'General',
        xpRequired: 3000,
      },
      {
        title: 'XP Master',
        description: 'Reach Level 10',
        iconName: 'Zap',
        category: 'General',
        xpRequired: 5000,
      },
      {
        title: 'Support Legend',
        description: 'Reach Level 20',
        iconName: 'Trophy',
        category: 'General',
        xpRequired: 10000,
      },
      {
        title: 'Perfect Student',
        description: 'Complete 15 lessons',
        iconName: 'GraduationCap',
        category: 'General',
        xpRequired: 2500,
      },
    ]).returning();
    console.log(`✅ Created ${allAchievements.length} achievements\n`);

    console.log('✨ Database seeding completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   - Courses: 3`);
    console.log(`   - Lessons: 15 (5 per course)`);
    console.log(`   - Achievements: 10`);
    console.log(`\n💡 Run 'npm run dev' to start the application`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seed();
