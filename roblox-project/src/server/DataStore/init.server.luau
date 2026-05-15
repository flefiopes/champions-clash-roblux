local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Shared = ReplicatedStorage:WaitForChild("Shared")
local Events = Shared:WaitForChild("Events")

local DataS = game:GetService("DataStoreService")
local DataStore = DataS:GetDataStore("DataStoreTest29")
local ListeningEvents = {}
local ServerListeningEvents = {}
local BaseData = {
	["Money"] = 100,
	["Factions"] =  {},
}
local YieldBool = {}

function YieldSaving(plr)
	if not YieldBool[plr.UserId] then YieldBool[plr.UserId] = {} end
	if rawlen(YieldBool[plr.UserId]) > 0 then
		for i,Resume in pairs(YieldBool[plr.UserId]) do
			Resume:Wait()
		end
	end
end
function Save(plr)
	print("Saving...")
	YieldSaving(plr)
	local success, err = pcall(function()
		DataStore:SetAsync("Data"..plr.UserId,shared["DATA"][plr.UserId])
	end)
	
	if not success then
		warn("Error saving data for " .. plr.Name .. ": " .. err)
	else
		print("Success!")
	end
	shared["DATA"][plr.UserId] = nil
	return true
end
function DataStructureCheck(data)
	for i,v in pairs(BaseData) do
		if i == "Stats" or  i == "Settings" or  i == "plrQuestsAdvencement" then
			if not data[i] then
				data[i] = v
			end
			for a,b in pairs(v) do
				if typeof(data[i][a]) ~= typeof(b) then
					data[i][a] = b
				end
			end
		else
			if not data[i] then
				data[i] = v
			end
		end
	end
end
function UpdateListeningObj(plr,Scope)
	if ListeningEvents[Scope] then
		ListeningEvents[Scope]:FireClient(plr,shared["DATA"][plr.UserId][Scope])
	end
	if ServerListeningEvents[Scope] then
		ServerListeningEvents[Scope]:Fire(plr,shared["DATA"][plr.UserId][Scope])
	end
end
function FindScope(Table, Path, Value, setnil)
	local CurrentScope = Table
	local LastScope = nil
	for i, v in ipairs(Path) do
		LastScope = v
		if i == #Path and (Value ~= nil or setnil) then
			CurrentScope[v] = Value
		else
			CurrentScope = CurrentScope[v]
		end
	end
	return CurrentScope, LastScope
end


Players.PlayerAdded:Connect(function(plr)
	shared["DATA"][plr.UserId] = DataStore:GetAsync("Data"..plr.UserId)
	if not shared["DATA"][plr.UserId] then
		print("new")
		shared["DATA"][plr.UserId] = BaseData;
		(script:WaitForChild("PlrJoinedFirstTime") :: BindableEvent):Fire(plr,shared["DATA"][plr.UserId])
	else
		DataStructureCheck(shared["DATA"][plr.UserId])
	end
	(script:WaitForChild("PlrJoined") :: BindableEvent):Fire(plr,shared["DATA"][plr.UserId])
end)

Players.PlayerRemoving:Connect(function(plr)
	task.wait(1)
	Save(plr)
end)

Events.DataStore.YieldSaving.OnInvoke = function(plr)
	local Resume = Instance.new("BindableEvent")
	table.insert(YieldBool[plr.UserId],Resume)
	return Resume
end

Events.DataStore.GetData.OnServerInvoke = function(plr,Scope)
	repeat task.wait() until shared["DATA"][plr.UserId]
	if not Scope then
		return shared["DATA"][plr.UserId]
	else
		return shared["DATA"][plr.UserId][Scope]
	end
end

Events.DataStore.GetDataServer.OnInvoke = function(plr,Scope)
	repeat task.wait() until shared["DATA"][plr.UserId]
	if not Scope then
		return shared["DATA"][plr.UserId]
	else
		return shared["DATA"][plr.UserId][Scope]
	end
end

Events.DataStore.ListenToServerData.OnServerInvoke = function(plr,Scope)
	local ListeningObj = ListeningEvents[Scope] or Instance.new("RemoteEvent",Events.ListenningEvents)
	ListeningObj.Name = Scope
	ListeningEvents[Scope] = ListeningObj
	ListeningObj:FireClient(plr,shared["DATA"][plr.UserId][Scope])
	return ListeningObj
end

Events.DataStore.ListenToData.OnInvoke = function(Scope)
	local ListeningObj = ServerListeningEvents[Scope] or Instance.new("BindableEvent",Events.ListenningEvents)
	ListeningObj.Name = Scope
	ServerListeningEvents[Scope] = ListeningObj
	return ListeningObj
end

Events.DataStore.AppendValue.Event:Connect(function(plr,Scope,Value,Key)
	repeat task.wait() until shared["DATA"][plr.UserId]
	if not Key then
		table.insert(shared["DATA"][plr.UserId][Scope],Value)
	else
		shared["DATA"][plr.UserId][Scope][tostring(Key)] = Value
	end
	UpdateListeningObj(plr,Scope)
end)

Events.DataStore.ChangeNumerical.Event:Connect(function(plr,Path,Value)
	repeat task.wait() until shared["DATA"][plr.UserId]
	local CurrentValue = FindScope(shared["DATA"][plr.UserId],Path)
	FindScope(shared["DATA"][plr.UserId],Path,math.floor(CurrentValue + Value))
	UpdateListeningObj(plr,Path[1])
end)

Events.DataStore.SetValue.Event:Connect(function(plr,Path,Value)
	repeat task.wait() until shared["DATA"][plr.UserId]
	local erase = false
	if Value == nil then
		erase = true
	end

	FindScope(shared["DATA"][plr.UserId],Path,Value,erase)
	UpdateListeningObj(plr,Path[1])
end)

game:BindToClose(function()
	for i,plr in pairs(Players:GetPlayers()) do
		Save(plr)
	end
end)
