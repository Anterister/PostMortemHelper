
from django.shortcuts import render

import json
from django.http import HttpResponse

import time

from urllib import urlretrieve

import pyodbc

def index(request):
    return render(request, 'myapp/home.html')


def query_bug_by_id(request):
	data = {}
	if request.is_ajax() and request.method == 'GET':
		server = "TK5BGITPSO3654"
		database = "PSOffice365Icm1Issue"
		bug_id = request.GET['bug_id'].strip()
		# bug_id = 2349107

		connectors = ["Driver={SQL Server}"]
		connectors.append ("Server=%s" % server)
		connectors.append ("Database=%s" % database)
		connectors.append ("TrustedConnection=Yes")
		cnxn = pyodbc.connect (";".join (connectors))
		cursor = cnxn.cursor()

		print 'before query'
		cursor.execute("""SELECT B.Area,
			B.[Title], 
			B.[Accountable Team], 
			B.[PM Root Cause Area],
			B.[PM Root Cause Area Specific],
			B.[Root Cause Bug],

			CASE WHEN (B.Status='Active') THEN B.[Assigned To] ELSE B.[Resolved By] END as OCE,

			B.Status,
			B.Severity,

			DATEDIFF(MINUTE, B.[Opened Date], CASE WHEN B.Status='Active'
				THEN GETUTCDATE() ELSE B.[Resolved Date] END) as MinutesToResolution,

			DATEDIFF(HOUR, B.[Opened Date], CASE WHEN B.Status='Active'
				THEN GETUTCDATE() ELSE B.[Resolved Date] END) as HoursToResolution 

			FROM BugsLatest 

			B WHERE B.[id]=%s""" % bug_id)
		
		row = cursor.fetchone()
		print "row: ", row
		if row:
			data['area'] = row[0], 
			data['title'] = row[1],
			data['accountable_team'] = row[2]

			data['dev'] = row[6]
			data['severity'] = row[8]
			data['duration'] = row[9]

			print "!"

			cursor.execute("""SELECT [Changed Date], [Changed By] 
				
				FROM [BugsAll]
				
				WHERE id=%s

				ORDER BY [Rev]""" % bug_id)

			print "!!"
			records = []
			while 1:
				row = cursor.fetchone()
				if row:
					records.append((row[0], row[1]))
				else:
					break
			print records

			cursor.execute("""SELECT FldName,
				AddedDate, 
				Words 

				FROM BugsLongTexts 

				WHERE id=%s 

				ORDER BY AddedDate""" % bug_id)

			descriptions = []
			repro_steps = ""
			print "!!!"

			rec_count = 0
			rec_len = len(records)
			initial_dt = records[0][0]
			last_dt = records[0][0]
			while 1:
				row = cursor.fetchone()

				if row:
					while rec_count < rec_len:
						# print rec_count, records[rec_count][0],  row[1]
						if not records[rec_count][0] == row[1]:
							descriptions.append((str(records[rec_count][0]), 
								"Edited by %s" % str(records[rec_count][1])) + 
							timeDifference(last_dt, records[rec_count][0], initial_dt))
							last_dt = records[rec_count][0]
							rec_count += 1
						else:
							break
					if row[0] == "Description":
						lines = str(row[2]).split('\n')
						# print lines
						if len(lines) <= 3:
							descriptions.append((str(row[1]), str(row[2])) + 
								timeDifference(last_dt, row[1], initial_dt))
						else:
							print 
							descriptions.append((str(row[1]), 
								("[Snippet]%s%s%s" % (lines[0], lines[1], lines[2]))) + 
							timeDifference(last_dt, row[1], initial_dt))
					else:
						repro_steps = str(row[2])
				else:
					data['descriptions'] = descriptions
					data['repro_steps'] = repro_steps
					break

		else:
			data['error'] = "Failed to find bug with id %s in the database." % bug_id
		
	else:
		data['error'] = "Bad request received. Please follow the instructions."

	# for i in data:
	# 	print i, data[i]
	return HttpResponse(json.dumps(data), content_type="application/json")



def get_list_bugs(request):
	data = {}
	if request.is_ajax() and request.method == 'GET':

		alias = request.GET['alias'].strip()
		print "alias:%s.." % alias

		server = "TK5BGITPSO3654"
		database = "PSOffice365Icm1Issue"
		connectors = ["Driver={SQL Server}"]
		connectors.append ("Server=%s" % server)
		connectors.append ("Database=%s" % database)
		connectors.append ("TrustedConnection=Yes")
		cnxn = pyodbc.connect (";".join (connectors))
		cursor = cnxn.cursor()

		if alias:
			print 'before query with alias'
			cursor.execute("""SELECT TOP 100 id, 
				[Opened Date], 
				Title,
				LEFT (Title, 30) as sTitle, 
				[Accountable Team],
				[Opened By],
				[Resolved By],
				[Assigned To] 

				FROM BugsLatest 

				WHERE [TreeID] in (5172, 5171) 
				AND ([Assigned To] = '%s' 
				OR [Resolved By] = '%s')

				ORDER BY [Opened Date] DESC""" % (alias, alias))

		else:
			print 'before query without alias'
			cursor.execute("""SELECT id, 
				[Opened Date], 
				Title,
				LEFT (Title, 28) as sTitle, 
				[Accountable Team],
				[Opened By],
				[Resolved By],
				[Assigned To] 

				FROM BugsLatest 

				WHERE [TreeID] in (5172, 5171) 
				AND [Status] = 'Resolved' 
				AND [Severity] = 1 

				ORDER BY [Opened Date] DESC""")

		print "!!"
		count = 0
		bugs = []
		while 1:
			row = cursor.fetchone()
			if row:
				count += 1
				# print row
				bugs.append((str(row[0]), row[1].strftime("%Y-%m-%d %H:%M"), 
					str(row[2]).replace("<","&lt;").replace(">","&gt;"), 
					str(row[3]).replace("<","&lt;").replace(">","&gt;"), 
					str(row[4]), str(row[5]), str(row[6]), str(row[7])))
			else:
				# print count, bugs
				break

		data['count'] = count
		data['bugs'] = bugs
	return HttpResponse(json.dumps(data), content_type="application/json")	


def timeDifference(t1, t2, t0):
	dt1 = (t2 - t1).total_seconds()/60
	dt0 = (t2 - t0).total_seconds()/60
	return format(dt1,'.2f'), format(dt0,'.2f')
