// See https://aka.ms/new-console-template for more information
using Sandbox;
using System;
using System.Runtime.CompilerServices;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;

internal class Program
{
    const string NG_PUBLIC_FOLDER = "C:\\Users\\verme\\source\\repos\\Psalter2025\\Psalter2025\\public\\";
    private static async Task Main(string[] args)
    {
        //await Migrate1912ToNewSchema();
        Generate2025Psalters();

        //var http = new HttpClient();
        //var audio = File.ReadAllText("C:\\Users\\verme\\Documents\\Psalter app files\\2025\\audio-urls.txt").Split("\n", StringSplitOptions.RemoveEmptyEntries);
        //foreach (var line in audio)
        //{
        //    var parts = line.Split(": ", StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

        //    var url = parts[1];
        //    var fileName = $"_{parts[0]}{Path.GetExtension(url)}";

        //    var audioStream = await http.GetStreamAsync(url);
        //    using FileStream fileStream = new FileStream($"{NG_PUBLIC_FOLDER}2025\\Audio\\{fileName}", FileMode.Create, FileAccess.Write);

        //    // 3. Asynchronously copy the download stream to the file stream
        //    await audioStream.CopyToAsync(fileStream);
        //}
    }

    private static void Generate2025Psalters()
    {
        var newPsalters = Get2025Psalters();
        var lyrics = File.ReadAllText("C:\\Users\\verme\\Documents\\Psalter app files\\2025\\lyrics.txt");

        var scoreFiles = Directory.GetFiles($"{NG_PUBLIC_FOLDER}2025\\Score")
            .Select(x => Path.GetFileName(x))
            .Select(x => new
            {
                ScoreFilePath = $"2025/Score/{x}",
                Number = ReadWhileDigit(x.TrimStart("_")),
                Letter = x.SkipWhile(x => !char.IsLetter(x)).FirstOrDefault().ToString(),
                IsRefrain = x.ToLower().Contains("_refrain")
            }).ToList();

        var audioFiles = Directory.GetFiles($"{NG_PUBLIC_FOLDER}2025\\Audio")
            .Select(x => Path.GetFileName(x))
            .Select(x => new
            {
                FilePath = $"2025/Audio/{x}",
                Identifier = Path.GetFileNameWithoutExtension(x).TrimStart("_")
            }).ToList();

        while (lyrics.Length > 0)
        {
            var iPsalterEnd = lyrics.IndexOf("_");
            var psalterText = iPsalterEnd == -1 ? lyrics : lyrics.Substring(0, iPsalterEnd).Trim();
            lyrics = lyrics.Substring(psalterText.Length).Trim().TrimStart("_").Trim();

            var parts = psalterText.Split("\n\n");
            var titleAndIdentifier = parts[0].Split("\n");
            var identifier = titleAndIdentifier[1].Split(" ")[1];

            var number = ReadWhileDigit(identifier).Value;
            var letter = identifier[number.ToString().Length..];
            int? psalm = titleAndIdentifier[1].StartsWith("Psalm") ? number : null;

            var psalter = newPsalters.FirstOrDefault(x => x.Number == number && x.Letter == letter);
            if (psalter == null)
                newPsalters.Add(psalter = new NewSchema { Number = number, Letter = letter });

            if (psalter.IsSpiritualSong == true)
                identifier = "SS" + identifier;
            psalter.Title = titleAndIdentifier[0];
            psalter.Psalm = psalm;

            //var expectedMaxVerses = parts.Select(x => ReadWhileDigit(x)).Max() ?? 1;
            //var verses = parts.Skip(1).ToList();
            //if (verses.Count > 1)
            //{
            //    psalter.Chorus = verses.FirstOrDefault(x => !char.IsDigit(x[0]))?.Trim();
            //    verses = verses.Where(x => x.Trim() != psalter.Chorus).ToList();
            //}
            //psalter.Verses = verses.Select(x => RemoveVerseNumber(x)).ToList();
            psalter.ScoreFiles = scoreFiles
                .Where(x => x.Number == psalter.Number && x.Letter == psalter.Letter)
                .Select(x => x.ScoreFilePath)
                .ToList();

            psalter.AudioFile = audioFiles.FirstOrDefault(x => x.Identifier == identifier)?.FilePath;

            //if (psalter.Verses.Count != expectedMaxVerses)
            //{
            //    newPsalters.Remove(psalter);
            //    WriteJson($"{NG_PUBLIC_FOLDER}2025\\psalter.json", newPsalters);
            //    throw new Exception();
            //}
        }

        newPsalters = newPsalters.OrderByDescending(x => x.IsSpiritualSong != true).ThenBy(x => x.Number).ThenBy(x => x.Letter).ToList();

        WriteJson($"{NG_PUBLIC_FOLDER}2025\\psalter.json", newPsalters);
    }

    //private (int, string) GetNumberAndLetter(string numberAndLetter)
    //{
    //    var number = ReadWhileDigit(numberAndLetter).Value;
    //    var letter = numberAndLetter[number.ToString().Length..];
    //    return (number, letter);
    //}
    private static int? ReadWhileDigit(string text)
    {
        var numericText = new string(text.TakeWhile(char.IsDigit).ToArray());
        return numericText.Length > 0 ? int.Parse(numericText) : null;
    }

    private static async Task Migrate1912ToNewSchema()
    {
        var json = await File.ReadAllTextAsync($"{AppDomain.CurrentDomain.BaseDirectory}\\psalter_oldschema.json");
        var oldSchema = JsonSerializer.Deserialize<List<OldSchema>>(json);
        var newSchema = oldSchema.Select(x => Convert(x)).ToList();
        var newPsalters = Get2025Psalters();

        foreach (var newPsalter in newPsalters)
        {
            var oldPsalter = newSchema.FirstOrDefault(x => x.Number.ToString() == newPsalter.OtherPsalterNumber);
            if (oldPsalter != null)
                oldPsalter.OtherPsalterNumber = newPsalter.Number + newPsalter.Letter;
        }

        WriteJson($"{NG_PUBLIC_FOLDER}1912\\psalter.json", newSchema);
    }

    private static void WriteJson(string path, List<NewSchema> newSchema)
    {
        File.WriteAllText(path, JsonSerializer.Serialize(newSchema, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
            WriteIndented = true,
            Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping // don't serialize apostrophes as \u000
        }));
    }

    private static List<NewSchema> Get2025Psalters()
    {
        var newPsalterJson = File.ReadAllText($"{NG_PUBLIC_FOLDER}2025\\psalter.json");
        return JsonSerializer.Deserialize<List<NewSchema>>(newPsalterJson, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });
    }

    private static NewSchema Convert(OldSchema old)
    {
        var oldVerses = old.lyrics.Split("\n\n").ToList();
        var chorus = oldVerses.FirstOrDefault(x => x.StartsWith("(CHORUS"));

        if (chorus != null)
        {
            // todo: handle x2
            oldVerses.Remove(chorus);
            var repeatTwice = chorus.Contains("x2");
            chorus = chorus.Substring(chorus.IndexOf("\n")).Trim();
            if (repeatTwice)
                chorus += "\n" + chorus;
        }

        var newSchema = new NewSchema
        {
            Number = old.number,
            SecondTune = old.Title.Contains("2nd") ? true : null,

            Title = old.heading,
            Psalm = old.psalm,
            Verses = oldVerses.Select(x => RemoveVerseNumber(x).Trim()).ToList(),
            Chorus = chorus,
            NumVersesInsideStaff = old.NumVersesInsideStaff,
            ScoreFiles = [old.scoreFileName],            
        };

        newSchema.AudioFile = $"1912\\Audio\\_{old.number}{(newSchema.SecondTune.GetValueOrDefault() ? "_2" : "")}.mp3";
        if (!File.Exists($"{NG_PUBLIC_FOLDER}{newSchema.AudioFile}"))
            newSchema.AudioFile = null;

        return newSchema;
    }

    public static string RemoveVerseNumber(string verse)
    {
        return new string(verse.SkipWhile(x => char.IsNumber(x) || x == '.' || x == ' ').ToArray());
    }
}

public class OldSchema
{
    public int NumVersesInsideStaff { get; set; }
    public string Title {get; set;}
    public int _id {get; set;}
    public string audioFileName {get; set;}
    public string heading {get; set;}
    public int isFavorite {get; set;}
    public string lyrics {get; set;}
    public int number {get; set;}
    public int numverses {get; set;}
    public int? psalm {get; set;}
    public string scoreFileName { get; set; }
}

public class NewSchema
{
    public required int Number { get; set; }
    public string? Letter { get; set; } // 2025
    public bool? SecondTune { get; set; } // 1912

    public string Title { get; set; }
    public int? Psalm { get; set; }
    public string? PsalmVerses { get; set; } // 2025
    public bool? IsCompletePsalm { get; set; } // 2025
    public bool? IsSpiritualSong { get; set; } // 2025

    public List<string> Verses { get; set; }
    public string? Chorus { get; set; }
    public int? NumVersesInsideStaff { get; set; } // 1912
    public List<string> ScoreFiles { get; set; }
    public string? AudioFile { get; set; }
    public string? OtherPsalterNumber { get; set; }
}